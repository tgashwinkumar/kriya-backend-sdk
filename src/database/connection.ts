import { Sequelize } from 'sequelize';

/**
 * Generates Sequelize object
 */
const getSequalizeConnection = () => {

    const dbName: string = process.env.DB_NAME as string;
    const dbUser: string = process.env.DB_USER as string;
    const dbPassword: string = process.env.DB_PASS as string;

    let connectionOption = {};

    if(process.env.DB_HOST) {
        const dbSocketAddr = (process.env.DB_HOST as string).split(':');
        connectionOption = {
            ...connectionOption,
            host: dbSocketAddr[0],
            port: dbSocketAddr[1],
        }

    } else if(process.env.CLOUD_SQL_CONNECTION_NAME) {

        const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';

        connectionOption = {
            ...connectionOption,
            host: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`
        }
    }

    return new Sequelize(dbName, dbUser, dbPassword, {
        dialect: process.env.DB_DIALECT as any,
        ...connectionOption,
        // dialectOptions: {
        //     useUTC: false
        // },
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        // timezone: '+05:30'
    });

}

export default getSequalizeConnection;
