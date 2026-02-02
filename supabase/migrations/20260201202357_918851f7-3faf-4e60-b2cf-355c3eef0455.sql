-- Enable realtime for verifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.verifications;

-- Enable realtime for chats table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;

-- Enable realtime for favorites table
ALTER PUBLICATION supabase_realtime ADD TABLE public.favorites;