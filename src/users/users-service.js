const UsersService = {
    getAllUsers(knex) {
        return knex('aware_users').select('*')
    },

    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('aware_users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex('aware_users')
            .select('*')
            .where('id', id)
            .first()
    },


    deleteUser(knex, id) {
        return knex('aware_users')
            .where('id', id)
            .delete()
    },

    updateUser(knex, ID, newData) {
        return knex('aware_users')
            .where('id', ID)
            .update(newData)
    }
}

module.exports = UsersService