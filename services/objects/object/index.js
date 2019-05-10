const mongoose = require('mongoose');
const ObjectModel = require('../../../db/object.model');

module.exports = async function (fastify, opts) {
    fastify
        .register(registerRoutes);
};

async function registerRoutes(fastify, opts) {
    fastify.route({
        method: 'GET',
        url: '/objects/:object',
        handler: getObject
    });

    fastify.route({
        method: 'PUT',
        url: '/objects/:object',
        beforeHandler: fastify.auth([fastify.verifyVkAuth]),
        handler: updateObject
    });

    async function getObject(request, reply) {
        let objectId = request.params.object;

        try {
            let object = await ObjectModel.findOne({ _id: mongoose.Types.ObjectId(objectId) });
            reply.type('application/json').code(200);
            return object;
        } catch (e) {
            reply.type('application/json').code(500);
            console.error(e);
            return { error: `Unable to get object: error when finding in db`}
        }
    }

    async function updateObject(request, reply) {
        let object = request.body;
        let objectId = request.params.object;

        if (object) {
            try {
                await ObjectModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(objectId) }, object, { upsert: true });
                reply.type('application/json').code(200);
                return await ObjectModel.findOne({ _id: mongoose.Types.ObjectId(objectId) });
            } catch (e) {
                reply.type('application/json').code(500);
                console.error(e);
                return { error: `Unable to update object: error when saving`}
            }
        } else {
            reply.type('application/json').code(400);
            return { error: `Unable to update object: object model hasn't been provided`}
        }
    }
}