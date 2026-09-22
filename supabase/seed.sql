-- Create an admin user in auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@inpl.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role": "ADMIN"}', NOW(), NOW());

-- Create a team user in auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'team1@inpl.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role": "TEAM"}', NOW(), NOW());

-- Create the team entity
INSERT INTO public.teams (id, name, short_name, color, initial_purse, remaining_purse, max_players, status) 
VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Mumbai Mavericks', 'MM', '#0033FF', 25.00, 25.00, 12, 'ACTIVE');

-- Link the team user's profile to the team
UPDATE public.profiles SET team_id = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

-- Add some dummy players
INSERT INTO public.players (player_code, name, role, base_price, status) VALUES
('INPL-P001', 'Virat Kohli', 'Batter', 0.50, 'AVAILABLE'),
('INPL-P002', 'Jasprit Bumrah', 'Bowler', 0.50, 'AVAILABLE');
