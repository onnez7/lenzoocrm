-- Inserir receitas ópticas
INSERT INTO prescriptions (client_id, date, doctor, right_eye_spherical, right_eye_cylindrical, right_eye_axis, right_eye_addition, left_eye_spherical, left_eye_cylindrical, left_eye_axis, left_eye_addition, pd, height, notes) VALUES
(1, '2024-01-15', 'Dr. Maria Oliveira', -2.00, -0.50, 90, 1.25, -1.75, -0.25, 85, 1.25, '62mm', '18mm', 'Receita para óculos progressivos'),
(1, '2023-06-20', 'Dr. Carlos Santos', -1.75, -0.25, 90, 1.00, -1.50, -0.25, 85, 1.00, '62mm', '18mm', 'Receita anterior'),
(2, '2024-01-10', 'Dr. Ana Silva', -1.50, -0.75, 88, 1.50, -1.25, -0.50, 92, 1.50, '64mm', '20mm', 'Primeira receita');

-- Inserir agendamentos
INSERT INTO appointments (client_id, franchise_id, date, time, type, status, notes) VALUES
(1, 1, '2024-01-15', '14:30:00', 'consulta', 'completed', 'Renovação de receita'),
(1, 1, '2024-02-20', '10:00:00', 'entrega', 'scheduled', 'Entrega de óculos novos'),
(2, 1, '2024-01-12', '15:00:00', 'consulta', 'completed', 'Primeira consulta'),
(2, 1, '2024-02-15', '16:00:00', 'retorno', 'scheduled', 'Retorno para ajustes'); 