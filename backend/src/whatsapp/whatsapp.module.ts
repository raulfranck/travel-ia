import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { MetaWhatsAppService } from './meta-whatsapp.service';
import { UserModule } from '../user/user.module';
import { TravelModule } from '../travel/travel.module';

@Module({
  imports: [UserModule, TravelModule],
  controllers: [WhatsappController],
  providers: [MetaWhatsAppService],
  exports: [MetaWhatsAppService],
})
export class WhatsappModule {}
