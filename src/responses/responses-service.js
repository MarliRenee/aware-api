const ResponsesService = {
    getAllResponses(knex) {
        return knex('iceberg_responses').select('*')
    },

    insertResponses(knex, newResponse) {
        return knex
            .insert(newResponse)
            .into('iceberg_responses')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex('iceberg_responses')
            .select('*')
            .where('id', id)
            .first()
    },


    deleteResponses(knex, id) {
        return knex('iceberg_responses')
            .where('id', id)
            .delete()
    },

    updateResponses(knex, ID, newData) {
        return knex('iceberg_responses')
            .where('id', ID)
            .update(newData)
    }
}

module.exports = ResponsesService