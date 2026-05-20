-- ============================================================
-- FAKE SEED DATA — for testing only
-- Run in Supabase SQL Editor
-- Uses real category IDs from the live DB
-- ============================================================

INSERT INTO award_nominations
  (award_category_id, award_category_name, nominee_name, nominator_name, nominator_email, nominator_matric, nominator_phone)
VALUES
-- ── Fake Nominator 1: Test Student A (2099/00001) ──────────
('c412b46d-272f-41f4-8f35-513c2bbfd51a','Brand of the Year','Fake Brand Co','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('0a7710cd-32b2-4865-a11b-a68dafe21ada','Innovation of the Year','Fake Innovator','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('e5785f1d-1881-4bda-9180-094a44d0af38','Entrepreneur of the Year','Fake Entrepreneur','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('0b6da0b0-6a53-40df-9184-69823b068cab','Freshest Fresher of the Year','Fake Fresher','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('6108b578-a06d-4650-bfaf-e975e9b09097','Most Fashionable (Female)','Fake Fashionista F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('ddffcdf6-a5f8-4080-9313-6f05bba0deb1','Most Fashionable (Male)','Fake Fashionista M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('8ed024be-47db-4e91-bda1-ed9d4315a50a','Rookie of the Year','Fake Rookie','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('55f54744-6ceb-4a94-b8ef-6457646ad2ca','Most Influential (Female)','Fake Influential F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('d8718b0c-a87e-4850-b1ab-b97f11c07690','Most Influential (Male)','Fake Influential M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('566506e7-0a64-4164-85da-8a4cced1727a','Most Popular (Male)','Fake Popular M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('18fa923d-ee61-4928-8abc-9737d5d602ea','Most Popular (Female)','Fake Popular F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('c65bf490-2970-4ad8-a071-5f918c42e460','Spotlight Award','Fake Spotlight','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('57036265-c7c3-4f31-a19e-467c448e0e1e','Most Sociable (Male)','Fake Sociable M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('768ac2ec-62e3-44c8-b9e1-8d17564e59a4','Most Sociable (Female)','Fake Sociable F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('325f0911-4c94-4c70-9ee2-da1d8aa0e4f1','Clique of the Year','Fake Clique','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('51795c91-27c7-4f61-a721-69201a740f48','Talent of the Year','Fake Talent','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('233ec654-5251-4d66-bb68-bdf3d360cdae','Content Creator of the Year','Fake Creator','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('1597d2a6-e3f1-4f03-a8a2-b7beb7b56c7a','Artiste of the Year','Fake Artiste','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('fb443fe0-28a3-4a1e-a626-22e47ce4e31b','DJ / Music Producer of the Year','Fake DJ','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('b9b6217d-fd78-4214-b075-3a913892e8c7','Icon 360','Fake Icon','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('8e229c45-48e3-4573-aa30-efe6f6b8eaaf','Next Rated','Fake Next Rated','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('d5537cdf-6281-4bf1-b0d9-3d183521aab5','Sports Personality (Male)','Fake Sports M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('d30dbaca-f375-4bdc-976c-b636fbda1287','Sports Personality (Female)','Fake Sports F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('3af04d04-e697-4412-b798-d23f1c81a906','Footballer of the Year (Male)','Fake Footballer M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('221bff77-be12-43a3-a07f-dda9e17b5125','Footballer of the Year (Female)','Fake Footballer F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('90370d5c-94a6-4850-91f1-2be7608bbebe','Basketball Player of the Year (Female)','Fake Baller F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('349a515c-68f7-4569-94f5-818df66ef4b8','Basketball Player of the Year (Male)','Fake Baller M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('e44c8f09-bae8-440f-b52f-b312a4d5f0ee','Graphic Designer of the Year','Fake Designer','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('bbbe3f22-78e1-4e20-9b25-8a23360a7fcb','Videographer of the Year','Fake Videographer','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('202255e3-b09f-4220-adaa-5a4ea104a868','Photographer of the Year','Fake Photographer','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('c96de374-04bb-4130-bc37-f6d3fe2e4964','Academic Excellence Award','Fake Academic','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('b56ce9c4-556e-4726-86dc-f8709a86d121','Most Outstanding Student of the Year','Fake Outstanding','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('e6da2ed3-8374-4d8e-ae52-e9e6d4a2c999','Distinguished Executive (Female)','Fake Exec F','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('4a875b8b-93a5-4eba-81fa-66153770d74c','Distinguished Executive (Male)','Fake Exec M','Test Student A','testa@bells.edu.ng','2099/00001',NULL),
('6840be15-7a36-429b-97ec-84138c80178c','Lecturer of the Year','Fake Lecturer','Test Student A','testa@bells.edu.ng','2099/00001',NULL),

-- ── Fake Nominator 2: Test Student B (2099/00002) ──────────
('c412b46d-272f-41f4-8f35-513c2bbfd51a','Brand of the Year','Real Brand','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('0a7710cd-32b2-4865-a11b-a68dafe21ada','Innovation of the Year','Fake Innovator','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('e5785f1d-1881-4bda-9180-094a44d0af38','Entrepreneur of the Year','Fake Entrepreneur','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('0b6da0b0-6a53-40df-9184-69823b068cab','Freshest Fresher of the Year','Fake Fresher','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('6108b578-a06d-4650-bfaf-e975e9b09097','Most Fashionable (Female)','Fake Fashionista F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('ddffcdf6-a5f8-4080-9313-6f05bba0deb1','Most Fashionable (Male)','Fake Fashionista M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('8ed024be-47db-4e91-bda1-ed9d4315a50a','Rookie of the Year','Fake Rookie','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('55f54744-6ceb-4a94-b8ef-6457646ad2ca','Most Influential (Female)','Fake Influential F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('d8718b0c-a87e-4850-b1ab-b97f11c07690','Most Influential (Male)','Fake Influential M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('566506e7-0a64-4164-85da-8a4cced1727a','Most Popular (Male)','Fake Popular M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('18fa923d-ee61-4928-8abc-9737d5d602ea','Most Popular (Female)','Fake Popular F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('c65bf490-2970-4ad8-a071-5f918c42e460','Spotlight Award','Fake Spotlight','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('57036265-c7c3-4f31-a19e-467c448e0e1e','Most Sociable (Male)','Fake Sociable M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('768ac2ec-62e3-44c8-b9e1-8d17564e59a4','Most Sociable (Female)','Fake Sociable F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('325f0911-4c94-4c70-9ee2-da1d8aa0e4f1','Clique of the Year','Fake Clique','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('51795c91-27c7-4f61-a721-69201a740f48','Talent of the Year','Fake Talent','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('233ec654-5251-4d66-bb68-bdf3d360cdae','Content Creator of the Year','Fake Creator','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('1597d2a6-e3f1-4f03-a8a2-b7beb7b56c7a','Artiste of the Year','Fake Artiste','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('fb443fe0-28a3-4a1e-a626-22e47ce4e31b','DJ / Music Producer of the Year','Fake DJ','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('b9b6217d-fd78-4214-b075-3a913892e8c7','Icon 360','Fake Icon','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('8e229c45-48e3-4573-aa30-efe6f6b8eaaf','Next Rated','Fake Next Rated','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('d5537cdf-6281-4bf1-b0d9-3d183521aab5','Sports Personality (Male)','Fake Sports M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('d30dbaca-f375-4bdc-976c-b636fbda1287','Sports Personality (Female)','Fake Sports F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('3af04d04-e697-4412-b798-d23f1c81a906','Footballer of the Year (Male)','Fake Footballer M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('221bff77-be12-43a3-a07f-dda9e17b5125','Footballer of the Year (Female)','Fake Footballer F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('90370d5c-94a6-4850-91f1-2be7608bbebe','Basketball Player of the Year (Female)','Fake Baller F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('349a515c-68f7-4569-94f5-818df66ef4b8','Basketball Player of the Year (Male)','Fake Baller M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('e44c8f09-bae8-440f-b52f-b312a4d5f0ee','Graphic Designer of the Year','Fake Designer','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('bbbe3f22-78e1-4e20-9b25-8a23360a7fcb','Videographer of the Year','Fake Videographer','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('202255e3-b09f-4220-adaa-5a4ea104a868','Photographer of the Year','Fake Photographer','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('c96de374-04bb-4130-bc37-f6d3fe2e4964','Academic Excellence Award','Fake Academic','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('b56ce9c4-556e-4726-86dc-f8709a86d121','Most Outstanding Student of the Year','Fake Outstanding','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('e6da2ed3-8374-4d8e-ae52-e9e6d4a2c999','Distinguished Executive (Female)','Fake Exec F','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('4a875b8b-93a5-4eba-81fa-66153770d74c','Distinguished Executive (Male)','Fake Exec M','Test Student B','testb@bells.edu.ng','2099/00002',NULL),
('6840be15-7a36-429b-97ec-84138c80178c','Lecturer of the Year','Fake Lecturer','Test Student B','testb@bells.edu.ng','2099/00002',NULL);

-- ============================================================
-- To CLEAN UP fake data after testing, run:
-- DELETE FROM award_nominations WHERE nominator_matric IN ('2099/00001','2099/00002');
-- ============================================================
