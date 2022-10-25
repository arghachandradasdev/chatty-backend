import { ServerError } from '@globals/helpers/error-handler';
import { config } from '@root/config';
import {BaseCache} from '@services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';

const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUID: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;

    const firstList: string[] = [
      '_id', `${_id}`,
      'uId', `${uId}`,
      'username', `${username}`,
      'email', `${email}`,
      'avatarColor', `${avatarColor}`,
      'createdAt', `${createdAt}`,
      'postsCount', `${postsCount}`,
      'quote', `${quote}`
    ];

    const secondList: string[] = [
      'blocked', JSON.stringify(blocked),
      'blockedBy', JSON.stringify(blockedBy),
      'profilePicture', `${profilePicture}`,
      'followersCount', `${followersCount}`,
      'followingCount', `${followingCount}`,
      'notifications', JSON.stringify(notifications),
      'social', JSON.stringify(social)
    ];

    const thirdList: string[] = [
      'work', `${work}`,
      'location', `${location}`,
      'school', `${school}`,
      'quote', `${school}`,
      'bgImageVersion', `${bgImageVersion}`,
      'bgImageId', `${bgImageId}`
    ];

    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if(!this.client.isOpen) {
        // if there is no connection
        await this.client.connect();
      }

      // creating sorted set
      await this.client.ZADD('user', {score: parseInt(userUID, 10), value: `${key}`});
      // adding item to set
      await this.client.HSET(`users:${key}`, dataToSave);

      // NOTE: we cannot fetch multiple users/keys from HSET , so we have to also use Sorted Set.
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
}
