import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** SWR-USR-001: registro con rol Productor o Comprador. */
export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(120)
  fullName!: string;

  @IsIn(['PRODUCER', 'BUYER'], { message: 'El rol debe ser Productor o Comprador' })
  role!: 'PRODUCER' | 'BUYER';

  @IsString()
  @IsNotEmpty({ message: 'El municipio es obligatorio' })
  municipality!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

/** SWR-AUTH-001: autenticación con correo y contraseña. */
export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
