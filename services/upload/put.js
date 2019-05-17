const { s3 } = require('../../config/aws');
const uuidv4 = require('uuid/v4');
const DotModel = require('../../db/dot.model');
const verifyVkAuth = require('../authenticate/verifyVkAuth');

module.exports = async function (fastify, opts) {
    fastify
        .register(() => registerRoutes(fastify, opts));
};

async function registerRoutes(fastify, opts) {
    const upload = opts.multer({
        storage: opts.multer.memoryStorage()
    });

    fastify.route({
        method: 'PUT',
        url: '/:type/:id/photos',
        preHandler: [upload.single('photo')],
        handler: async (request, reply) => await verifyVkAuth(request, reply, put)
    });
}

async function put(request, reply) {
    try {
        const { type, id } = request.params;
        const extension = request.file.originalname.split('.').pop().toLowerCase();
        const name = `${uuidv4()}.${extension}`;

        const file = request.file.buffer;
        const key = `photos/${type}s/${id}/${name}`;

        await _putPhotoToS3(file, key);
        await _putPhotoToModel(type, id, key);

        reply.code(200).send({ key });
    } catch (e) {
        reply.code(400).send({ error: e.message });
    }
}

async function _putPhotoToS3(photo, key) {
    return new Promise((resolve, reject) => {
        s3.upload({
            Key: key,
            Body: photo,
            ACL: 'public-read'
        }, (err, data) => {
            if (err) {
                console.error('There was an error uploading your photo: ', err.message);
                reject(err.message);
            }

            resolve(data);
        });
    });
}

async function _putPhotoToModel(type, id, key) {
    let dot = await DotModel.findOne({ id });
    let images = dot._doc.images;

    await DotModel.findOneAndUpdate({ id }, { images: images ? [...images, key] : [key]});
}