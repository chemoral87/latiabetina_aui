import UserRepository from "../UserRepository"
import ProfileRepository from "../ProfileRepository"
import WhatsappRepository from "../WhatsappRepository"
import WhatsappMessageLogRepository from "../WhatsappMessageLogRepository"

import CommonRepository from "./CommonRepository"
import ParentRepository from "./ParentRepository"

// import SkyRegistrationRepository from '../SkyRegistrationRepository'

export default ($axios) => ({
  Role: CommonRepository($axios)("/role"),
  Permission: CommonRepository($axios)("/permission"),
  User: UserRepository($axios)("/user"),
  Profile: ProfileRepository($axios)("/profile"),
  Whatsapp: WhatsappRepository($axios)("/whatsapp"),
  WhatsappMessageLog: WhatsappMessageLogRepository($axios)("/whatsapp"),
  Organization: CommonRepository($axios)("/organization"),
  Auditorium: CommonRepository($axios)("/auditorium"),
  AuditoriumEvent: CommonRepository($axios)("/auditorium-event"),
  AuditoriumEventSeat: CommonRepository($axios)("/auditorium-event-seat"),
  AuditoriumEventSeatLog: CommonRepository($axios)("/auditorium-event-seat-log"),
  Testimony: CommonRepository($axios)("/testimony"),
  ChurchEvent: CommonRepository($axios)("/church-event"),
  /// ////////Admin Repository////////////////////////
  Store: CommonRepository($axios)("/store"),
  ConsoSheet: CommonRepository($axios)("/conso-sheet"),
  ChurchMember: CommonRepository($axios)("/church-member"),
  ParkingCarContact: ParentRepository($axios)("/parking-car-contact"),
})
