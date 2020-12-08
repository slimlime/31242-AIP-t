import { DataTypes, Op } from "sequelize";
import User, { IUserAttributes } from "../models/User";
import db from "./DBInstance";

/*
 *  Users database table definition
 */

// users table

User.init(
  {
    username: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.CHAR(60),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "users",
    timestamps: false,
  }
);

/*
 *  User CRUD operations
 */

export async function getUser(username: string) {
  return User.findByPk(username);
}

export async function getBasicUser(username: string) {
  const user = await getUser(username);
  if (user) {
    return {
      username: user.username,
      display_name: user.display_name,
    };
  }
  return null;
}

export interface IUsersFilter {
  start: number;
  limit: number;
  search?: string;
}

export async function getUsers(
  filter: IUsersFilter,
  includePasswordHash = false
) {
  const attributes = ["username", "display_name"];
  if (includePasswordHash) {
    attributes.push("password_hash");
  }

  return User.findAll({
    attributes: attributes,
    where: filter.search // if search is provided
      ? {
          // search for string contained in username OR display_name
          [Op.or]: [
            {
              username: {
                [Op.substring]: filter.search,
              },
            },
            {
              display_name: {
                [Op.substring]: filter.search,
              },
            },
          ],
        }
      : undefined,
    offset: filter.start,
    limit: filter.limit,
  });
}

export async function createUser(user: IUserAttributes) {
  return User.create(user);
}

export async function deleteAllUsers() {
  return User.destroy({ truncate: true });
}
