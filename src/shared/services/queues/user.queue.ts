import {BaseQueue} from '@services/queues/base.queue';
import { userWorker } from '@workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');

    this.processJob('addUserToDB', 5, userWorker.addUserToDB); // this will happen later after addJob()
  }

  public addUserJob(name: string, data: any): void {
    this.addJob(name, data); // adding job to queue
  }
}

export const userQueue: UserQueue = new UserQueue();
