const { s3 } = require('../../config/aws');
const uuidv4 = require('uuid/v4');
const UserModel = require('../../db/user.model');
const DotModel = require('../../db/dot.model');

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
        handler: async function (request, reply) {
            await verifyVkAuth(request, reply, uploadPhoto);
        }
    });
}

// TODO: Get rid of verifyVkAuth, make array of preHandler functions working together
async function verifyVkAuth(request, reply, callback) {
    let token = request.headers['token'];

    if (token) {
        let user = await UserModel.findOne({ token });

        if (user && user.tokenExpiresIn - Date.now() > 0) {
            return callback(request, reply);
        }

        reply.code(400).send({ error: 'Token is invalid or expired' });
    }

    reply.code(400).send({ error: 'No token provided' });
}

async function uploadPhoto(request, reply) {
    try {
        const { type, id } = request.params;
        const extension = request.file.originalname.split('.').pop().toLowerCase();
        const name = `${uuidv4()}.${extension}`;

        const file = request.file.buffer;
        const key = `photos/${type}s/${id}/${name}`;

        await _uploadPhotoToS3(file, key);
        await _updateDotModel(id, key);

        reply.code(200).send({ key });
    } catch (e) {
        reply.code(400).send({ error: e.message });
    }
}

async function _uploadPhotoToS3(photo, key) {
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

async function _updateDotModel(id, key) {
    let dot = await DotModel.findOne({ id });
    let images = dot._doc.images;

    await DotModel.findOneAndUpdate({ id }, { images: images ? [...images, key] : [key]});
}