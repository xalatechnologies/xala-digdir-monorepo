/**
 * User Module
 */
import { Module } from '../../core/decorators';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: ['UserService', 'UserRepository'],
})
export class UserModule {}

export { UserController, UserService, UserRepository };
