// MODEL: câu hỏi / yêu cầu hỗ trợ của khách
import { get, set } from "./storage";

export type Enquiry = { id: string; email: string; topic: string; message: string; reply?: string; bookingId?: string };

export const enquiries = () => get<Enquiry[]>("ph2_enquiries", []);
export const saveEnquiries = (e: Enquiry[]) => set("ph2_enquiries", e);
