
import { Model } from "sequelize";
import { QueryTypes } from "sequelize";

import { PaymentTransaction, Profile, SequelizeQuery, User } from "../../database";
import { AuthExceptions, handleError, ProfileExceptions } from "../../exceptions";
import { IProfile, IUser } from "../../interfaces/models";
import { FindOptions } from "sequelize";
import { Op } from "sequelize";
import { formatKriyaId } from "../../generators";

/**
 * Creates a new user and assigned Kriya ID to it
 * @param user User object to persist in database
 */
export const createUserInDatabase = async (user: IUser) => {

    return SequelizeQuery.query(`SELECT nextval('kriya_id_seq') as "kriyaIdSeq"`, {type: QueryTypes.SELECT})
        .then(([result]: any[]) => {

        const kriyaId: string = formatKriyaId(parseInt(result.kriyaIdSeq, 10)) as string;

        // Creates new user in db with generated Kriya ID
        return User.create({
            email: user.email,
            firebaseUId: user.firebaseUId,
            kriyaId,
        }).catch((err) => {
            if ((err.parent || {}).code === "ER_DUP_ENTRY") {
                throw handleError(AuthExceptions.USER_DUPLICATE_ENTRY, `User already exists with same ${Object.keys(err.fields)[0]}`, {}, user.email);
            }
            throw handleError(AuthExceptions.USER_CREATION_ERROR, "", err);
        });

    }).catch((err) => {
        throw handleError(AuthExceptions.USER_CREATION_ERROR, "", err);
    });

};

/**
 * Find and return User Model using Kriya ID
 * @param kriyaId Kriya ID of the participant
 */
export const findUserByKriyaId = (kriyaId: string, options?: Omit<FindOptions<Model<IUser, IUser>['_attributes']>, 'where'>): Promise<Model<IUser>> => {

    if(!options) {
        options = {
            include: [{
                as: "profile",
                model: Profile,
                attributes: ["isPSGStudent"],
            }],
        }
    }

    return User.findByPk(kriyaId, options)
        .then((model) => {
            if (model) {
                return model;
            } else {
                throw handleError(AuthExceptions.USER_NOT_FOUND, "There is no user record corresponding to this identifier. The user may have been deleted.", {}, kriyaId);
            }
        }).catch((err) => {
            throw handleError(AuthExceptions.USER_READING_ERROR, "", err, kriyaId);
        });
};

/**
 * Create a new profile for the user
 * @param kriyaId Kriya Id
 * @param profile Profile details
 */
export const createUserProfile = (kriyaId: string, profile: IProfile) => {
    return Profile.create({
        ...profile,
        kriyaId,
    }).catch((err) => {
        if(err.name === "SequelizeUniqueConstraintError") {
            throw handleError(AuthExceptions.USER_DUPLICATE_ENTRY, `User profile already created`, {}, kriyaId)
        }
        throw handleError(AuthExceptions.PROFILE_CREATION_ERROR, "", err);
    });
};

/**
 * Updated the user that is poined out by Kriya ID
 * @param kriyaId Kriya ID of profile to be updated
 * @param user User object with params to be updated
 */
export const updateUserByKriyaId = (kriyaId: string, user: Partial<IProfile>) => {
    return Profile.update(user, {
        where: {
            kriyaId,
        },
    }).then((resp) => {
        console.log(resp);
    }).catch((err) => {
        throw handleError(ProfileExceptions.PROFILE_UPDATE_ERROR, "", err, kriyaId);
    });
};

/**
 * Fetched Kriya ID and general registration fee details for usage in middleware
 * @param email Email ID of the user
 */
export const authDetailsByEmail = (email: string) =>
    User.findOne({
        where: { email },
        attributes: ["email", "kriyaId"],
        include: [{
            model: Profile,
            as: "profile",
            attributes: ["isPSGStudent"],
        }, {
            subQuery: true,
            model: PaymentTransaction,
            where: {
                [Op.and]: [
                    {type: 'E'},
                    {status: 'S'}
                ]
            },
            attributes: [["createdAt", "paidOn"]],
            required: false,
            as: "transactions",
        }],
    }).then((user) => {
        if (user) {
            return user.toJSON();
        } else {
            throw handleError(AuthExceptions.USER_NOT_FOUND, "User not found", {}, email);
        }
    }).catch((err) => {
        throw handleError(AuthExceptions.USER_VERIFICATION_ERROR, "", err, email);
    });

export const findUserByEmail = (email: string) => {
    return User.findOne({
        where: {email}
    }).then((user) => {
        if (user) {
            return user;
        } else {
            throw handleError(AuthExceptions.USER_NOT_FOUND, "User not found", {}, email);
        }
    }).catch((err) => {
        throw handleError(AuthExceptions.USER_READING_ERROR, "", err, email);
    });
}
