const IcebergsService = {
    getAllIcebergs(knex, userId) {
        return knex('icebergs').select('*')
    },
    // getAllIcebergs(knex, userId) {
    //     return knex('icebergs').select('*').where({userid: userId})
    // },

    insertIceberg(knex, newIceberg) {
        return knex
            .insert(newIceberg)
            .into('icebergs')
            .returning('*')
            .then(rows => {
                return rows[0]
                //originally rows.[0]
            })
    },

    getById(knex, id) {
        return knex('icebergs')
            .select('*')
            .where('id', id)
            .first()
    },


    deleteIceberg(knex, id) {
        return knex('icebergs')
            .where('id', id)
            .delete()
    },

    updateIceberg(knex, ID, newData) {
        return knex('icebergs')
            .where('id', ID)
            .update(newData)
    }
}

module.exports = IcebergsService