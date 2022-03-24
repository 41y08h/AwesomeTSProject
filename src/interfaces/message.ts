export interface IMessage {
  id?: number;
  text: string;
  sender: string;
  receiver: string;
  created_at?: string;
  delivered_at?: string;
  read_at?: string;
}
