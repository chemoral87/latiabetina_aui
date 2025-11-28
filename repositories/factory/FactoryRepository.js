import UserRepository from "../UserRepository"

import ProfileRepository from "../ProfileRepository"

import CommonRepository from "./CommonRepository"
import ParentRepository from "./ParentRepository"

// import SkyRegistrationRepository from '../SkyRegistrationRepository'

export default ($axios) => ({
  Role: CommonRepository($axios)("/role"),
  Permission: CommonRepository($axios)("/permission"),
  User: UserRepository($axios)("/user"),
  Profile: ProfileRepository($axios)("/profile"),
  Organization: CommonRepository($axios)("/organization"),
  Auditorium: CommonRepository($axios)("/auditorium"),
  /// ////////Admin Repository////////////////////////
  Store: CommonRepository($axios)("/store"),
  // Investor: InvestorRepository($axios)("/investor"),
  // InvestorProfile: InvestorProfileRepository($axios)("/investor-profile"),
  // Investment: InvestmentRepository($axios)("/investment"),
  // Credit: CreditRepository($axios)("/credit"),
  // Consolidation: CommonRepository($axios)("/consolidation"),
  // Member: MemberRepository($axios)("/members"),
  // MemberAddess: CommonRepository($axios)("/member-addresses"),
  // MemberCall: MemberCallRepository($axios)("/member-calls"),
  // FaithHouse: CommonRepository($axios)("/faith-house"),
  // FaithHouseContact: ParentRepository($axios)("/faith-house-contact"),
  // FaithHouseMembership: CommonRepository($axios)("/faith-house-membership"),
  // Organization: CommonRepository($axios)("/organizations"),
  // OrganizationConfig: ParentRepository($axios)("/organization-configs"),
  // ParkingCar: CommonRepository($axios)("/parking-car"),
  ParkingCarContact: ParentRepository($axios)("/parking-car-contact"),
  // Config: CommonRepository($axios)("/configs"),
  // AgroEvent: AgroEventRepository($axios)("/agro-event"),
  // Attendant: CommonRepository($axios)("/attendant"),
  // AttendantMinistry: CommonRepository($axios)("/attendant-ministry"),
  // Texting: CommonRepository($axios)("/texting"),
  // TemplateGenerator: TemplateGeneratorRepository($axios)("/template-generator"),
  // Ministry: CommonRepository($axios)("/ministry"),
  // MinistryLeader: MinistryLeaderRepository($axios)("/ministry-leader"),
  // Bible: CommonRepository($axios)("/bible"),
  // ChurchService: CommonRepository($axios)("/church-service"),
  // ChurchServiceAttendant: CommonRepository($axios)("/church-service-attendant"),
  // SkyRegistration: CommonRepository($axios)("/sky-registration"),
  // SkyRoom: CommonRepository($axios)("/sky-room"),
  // ForgotPasswordRepository: ForgotPasswordRepository($axios)('/forgot-password')
})
