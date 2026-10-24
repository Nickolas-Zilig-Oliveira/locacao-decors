-- Sample data for local development / demo

insert into tenants (id, slug, name, city, phone, description, cnpj, email, address, pickup_notes) values
  ('00000000-0000-0000-0000-000000000001', 'lavita-decor', 'Lavita Decor', 'Itapecerica da Serra', '(11) 90000-0000',
   'Locação de kits de decoração para festas: chá de bebê, temas infantis, casamento e mais.',
   '00.000.000/0001-00', 'contato@lavitadecor.example', 'Rua Exemplo, 123 - Itapecerica da Serra - SP',
   'A retirada dos itens locados deve ser realizada às sextas-feiras das 10h às 17h. Para outros dias, os horários devem ser previamente acordados.');

insert into categories (id, tenant_id, name, slug, sort_order) values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Tema Menina', 'tema-menina', 1),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Chá de Bebê', 'cha-de-bebe', 2),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Casamento', 'casamento', 3);

insert into items (id, tenant_id, category_id, name, slug, description, price, piece_count, images) values
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011',
   'Baby & Urso', 'baby-e-urso', 'Kit completo tema Baby & Urso, pegue e monte.', 270.00, 17, '[]'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012',
   'Chá de Bebê Azul', 'cha-de-bebe-azul', 'Decoração completa para chá de bebê, tons de azul.', 250.00, 12, '[]'),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013',
   'Casamento Novo', 'casamento-novo', 'Kit de decoração para casamento, estilo clássico.', 200.00, null, '[]');
