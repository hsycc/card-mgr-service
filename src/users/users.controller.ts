import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiExtraModels,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { AppErrorTypeEnum } from '@/common/error/AppErrorTypeMap';
import { AppError } from '@/common/error/AppError';
import { ApiObjResponse } from '@/common/decorators/api-obj-response.decorator';

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersPaginatedDto } from './dto/users-pagination.dto';
import { CurrentUserDto } from './dto/current-user.dto';
import {
  ResponseDto,
  ResponseObjDto,
  ResponseListDto,
  ResPaginatedDto,
  ResponsePaginatedDto,
} from '@/common/dto/response.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@Controller('api/users')
@ApiTags('users')
@ApiExtraModels(
  UserEntity,
  CurrentUserDto,
  ResponseDto,
  ResponseObjDto,
  ResponseListDto,
  ResPaginatedDto,
  ResponsePaginatedDto,
)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/current')
  @UseGuards(AuthGuard())
  @ApiSecurity('bearer')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiObjResponse(CurrentUserDto)
  QueryCurrentUser(@CurrentUser() userId: number): Promise<any> {
    return this.usersService.queryUser(userId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiSecurity('bearer')
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: '创建用户' }) // 超级管理员才能创建用户
  @ApiObjResponse(UserEntity)
  CreateUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.usersService.createUser(createUserDto);
  }

  @Get('')
  @Roles('ADMIN')
  @ApiSecurity('bearer')
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: '获取用户列表' })
  @ApiPaginatedResponse(UserEntity)
  QueryAllUsers(@Query() usersPaginatedDto: UsersPaginatedDto): Promise<any> {
    return this.usersService.queryAllUsers(usersPaginatedDto);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiSecurity('bearer')
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: '查找用户' })
  @ApiObjResponse(UserEntity)
  QueryUser(@Param('id') id: number): Promise<any> {
    return this.usersService.queryUser(id);
  }

  @Patch('/role/:id')
  @Roles('ADMIN')
  @ApiSecurity('bearer')
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: '修改用户角色' })
  @ApiOkResponse({
    type: ResponseDto,
  })
  UpdateUserRole(@Param('id') id: number): Promise<any> {
    if (id === 1) {
      throw new AppError(AppErrorTypeEnum.NOT_MODIFY_SUP);
    }
    return this.usersService.updateUserRole(id);
  }

  @Patch('/enable/:id')
  @Roles('ADMIN')
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiSecurity('bearer')
  @ApiOperation({ summary: '启用/停用用户' })
  @ApiOkResponse({
    type: ResponseDto,
  })
  UpdateUserStatus(@Param('id') id: number): Promise<any> {
    if (id === 1) {
      throw new AppError(AppErrorTypeEnum.NOT_MODIFY_SUP);
    }
    return this.usersService.updateUserStatus(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiSecurity('bearer')
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: '软删除用户' })
  @ApiOkResponse({
    type: ResponseDto,
  })
  DeleteUser(
    @Param('id') id: number,
    @CurrentUser() userId: number,
  ): Promise<any> {
    if (id === 1) {
      throw new AppError(AppErrorTypeEnum.NOT_MODIFY_SUP);
    }
    if (userId === id) {
      throw new AppError(AppErrorTypeEnum.NOT_MODIFY_CURRENT);
    }
    return this.usersService.deleteUser(id);
  }

  @Patch('/update_password')
  @UseGuards(AuthGuard())
  @ApiSecurity('bearer')
  @ApiOperation({ summary: '更新用户密码' })
  @ApiOkResponse({
    type: ResponseDto,
  })
  UpdatePassword(
    @CurrentUser() userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<any> {
    return this.usersService.updatePassword(userId, updatePasswordDto);
  }
}