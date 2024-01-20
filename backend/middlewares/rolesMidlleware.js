module.exports = (rolesArr) => {
    return (req, res, next) => {
        try {
            const { roles } = req.user;

            let hasRole = false;
            roles.forEach((role) => {
                if (rolesArr.includes(role)) {
                    hasRole = true;
                }
            });

            if (!hasRole) {
                res.status(403);
                throw new Error("Permisson denied");
            }

            next();
        } catch (error) {
            res.status(403).json({ code: 403, msg: error.message });
        }
    };
};

// {
//     students: [ 'Lesia', 'Egor', 'Max' ],
//     teacher: 'Bob',
//     id: '65a58ac8a9dd850e888bdf70',
//     roles: [ 'ADMIN' ],
//     iat: 1705348033,
//     exp: 1705376833
//   }
