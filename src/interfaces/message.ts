export interface IMessage {
  id?: number;
  text: string;
  sender: string;
  receiver: string;
  created_at?: string;
  image_url?: string;
  local_image_url?: string;
  delivered_at?: string;
  read_at?: string;
}
