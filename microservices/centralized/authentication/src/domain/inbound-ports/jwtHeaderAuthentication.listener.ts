import { CidDTO } from 'src/interfaces/dto/cid.dto';
import { JwtDTO } from 'src/interfaces/dto/jwt.dto';

export interface JwtHeaderAuthenticationListener {
    authenticate(jwtDTO: JwtDTO, cidDTO: CidDTO): string;
}
