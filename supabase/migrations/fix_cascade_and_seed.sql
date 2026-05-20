-- ============================================================
-- PART 1: Fix the CASCADE so nominations can NEVER be 
-- accidentally deleted again when a category is deleted.
-- Changes ON DELETE CASCADE → ON DELETE RESTRICT
-- ============================================================

ALTER TABLE award_nominations
  DROP CONSTRAINT IF EXISTS award_nominations_award_category_id_fkey;

ALTER TABLE award_nominations
  ADD CONSTRAINT award_nominations_award_category_id_fkey
  FOREIGN KEY (award_category_id)
  REFERENCES award_categories(id)
  ON DELETE RESTRICT;  -- Now DB will ERROR if you try to delete a category that has nominations

-- ============================================================
-- PART 2: Seed 10 fake nominators using real nominee names
-- Uses real category IDs from your live DB
-- Safe to run multiple times — matrics are clearly fake (2099/xxxxx)
-- ============================================================

DO $$
DECLARE
  fake_nominators TEXT[][] := ARRAY[
    ARRAY['2099/10001','Fake Voter 1','fakevoter1@test.com'],
    ARRAY['2099/10002','Fake Voter 2','fakevoter2@test.com'],
    ARRAY['2099/10003','Fake Voter 3','fakevoter3@test.com'],
    ARRAY['2099/10004','Fake Voter 4','fakevoter4@test.com'],
    ARRAY['2099/10005','Fake Voter 5','fakevoter5@test.com'],
    ARRAY['2099/10006','Fake Voter 6','fakevoter6@test.com'],
    ARRAY['2099/10007','Fake Voter 7','fakevoter7@test.com'],
    ARRAY['2099/10008','Fake Voter 8','fakevoter8@test.com'],
    ARRAY['2099/10009','Fake Voter 9','fakevoter9@test.com'],
    ARRAY['2099/10010','Fake Voter 10','fakevoter10@test.com'],
    ARRAY['2099/10011','Fake Voter 11','fakevoter11@test.com'],
    ARRAY['2099/10012','Fake Voter 12','fakevoter12@test.com'],
    ARRAY['2099/10013','Fake Voter 13','fakevoter13@test.com'],
    ARRAY['2099/10014','Fake Voter 14','fakevoter14@test.com'],
    ARRAY['2099/10015','Fake Voter 15','fakevoter15@test.com'],
    ARRAY['2099/10016','Fake Voter 16','fakevoter16@test.com'],
    ARRAY['2099/10017','Fake Voter 17','fakevoter17@test.com'],
    ARRAY['2099/10018','Fake Voter 18','fakevoter18@test.com'],
    ARRAY['2099/10019','Fake Voter 19','fakevoter19@test.com'],
    ARRAY['2099/10020','Fake Voter 20','fakevoter20@test.com'],
    ARRAY['2099/10021','Fake Voter 21','fakevoter21@test.com'],
    ARRAY['2099/10022','Fake Voter 22','fakevoter22@test.com'],
    ARRAY['2099/10023','Fake Voter 23','fakevoter23@test.com'],
    ARRAY['2099/10024','Fake Voter 24','fakevoter24@test.com'],
    ARRAY['2099/10025','Fake Voter 25','fakevoter25@test.com'],
    ARRAY['2099/10026','Fake Voter 26','fakevoter26@test.com'],
    ARRAY['2099/10027','Fake Voter 27','fakevoter27@test.com'],
    ARRAY['2099/10028','Fake Voter 28','fakevoter28@test.com'],
    ARRAY['2099/10029','Fake Voter 29','fakevoter29@test.com'],
    ARRAY['2099/10030','Fake Voter 30','fakevoter30@test.com'],
    ARRAY['2099/10031','Fake Voter 31','fakevoter31@test.com'],
    ARRAY['2099/10032','Fake Voter 32','fakevoter32@test.com'],
    ARRAY['2099/10033','Fake Voter 33','fakevoter33@test.com'],
    ARRAY['2099/10034','Fake Voter 34','fakevoter34@test.com'],
    ARRAY['2099/10035','Fake Voter 35','fakevoter35@test.com'],
    ARRAY['2099/10036','Fake Voter 36','fakevoter36@test.com'],
    ARRAY['2099/10037','Fake Voter 37','fakevoter37@test.com'],
    ARRAY['2099/10038','Fake Voter 38','fakevoter38@test.com'],
    ARRAY['2099/10039','Fake Voter 39','fakevoter39@test.com'],
    ARRAY['2099/10040','Fake Voter 40','fakevoter40@test.com'],
    ARRAY['2099/10041','Fake Voter 41','fakevoter41@test.com'],
    ARRAY['2099/10042','Fake Voter 42','fakevoter42@test.com'],
    ARRAY['2099/10043','Fake Voter 43','fakevoter43@test.com'],
    ARRAY['2099/10044','Fake Voter 44','fakevoter44@test.com'],
    ARRAY['2099/10045','Fake Voter 45','fakevoter45@test.com'],
    ARRAY['2099/10046','Fake Voter 46','fakevoter46@test.com'],
    ARRAY['2099/10047','Fake Voter 47','fakevoter47@test.com'],
    ARRAY['2099/10048','Fake Voter 48','fakevoter48@test.com'],
    ARRAY['2099/10049','Fake Voter 49','fakevoter49@test.com'],
    ARRAY['2099/10050','Fake Voter 50','fakevoter50@test.com'],
    ARRAY['2099/10051','Fake Voter 51','fakevoter51@test.com'],
    ARRAY['2099/10052','Fake Voter 52','fakevoter52@test.com'],
    ARRAY['2099/10053','Fake Voter 53','fakevoter53@test.com'],
    ARRAY['2099/10054','Fake Voter 54','fakevoter54@test.com'],
    ARRAY['2099/10055','Fake Voter 55','fakevoter55@test.com'],
    ARRAY['2099/10056','Fake Voter 56','fakevoter56@test.com'],
    ARRAY['2099/10057','Fake Voter 57','fakevoter57@test.com'],
    ARRAY['2099/10058','Fake Voter 58','fakevoter58@test.com'],
    ARRAY['2099/10059','Fake Voter 59','fakevoter59@test.com'],
    ARRAY['2099/10060','Fake Voter 60','fakevoter60@test.com'],
    ARRAY['2099/10061','Fake Voter 61','fakevoter61@test.com'],
    ARRAY['2099/10062','Fake Voter 62','fakevoter62@test.com'],
    ARRAY['2099/10063','Fake Voter 63','fakevoter63@test.com'],
    ARRAY['2099/10064','Fake Voter 64','fakevoter64@test.com'],
    ARRAY['2099/10065','Fake Voter 65','fakevoter65@test.com'],
    ARRAY['2099/10066','Fake Voter 66','fakevoter66@test.com'],
    ARRAY['2099/10067','Fake Voter 67','fakevoter67@test.com'],
    ARRAY['2099/10068','Fake Voter 68','fakevoter68@test.com'],
    ARRAY['2099/10069','Fake Voter 69','fakevoter69@test.com'],
    ARRAY['2099/10070','Fake Voter 70','fakevoter70@test.com'],
    ARRAY['2099/10071','Fake Voter 71','fakevoter71@test.com'],
    ARRAY['2099/10072','Fake Voter 72','fakevoter72@test.com'],
    ARRAY['2099/10073','Fake Voter 73','fakevoter73@test.com'],
    ARRAY['2099/10074','Fake Voter 74','fakevoter74@test.com'],
    ARRAY['2099/10075','Fake Voter 75','fakevoter75@test.com'],
    ARRAY['2099/10076','Fake Voter 76','fakevoter76@test.com'],
    ARRAY['2099/10077','Fake Voter 77','fakevoter77@test.com'],
    ARRAY['2099/10078','Fake Voter 78','fakevoter78@test.com'],
    ARRAY['2099/10079','Fake Voter 79','fakevoter79@test.com'],
    ARRAY['2099/10080','Fake Voter 80','fakevoter80@test.com'],
    ARRAY['2099/10081','Fake Voter 81','fakevoter81@test.com'],
    ARRAY['2099/10082','Fake Voter 82','fakevoter82@test.com'],
    ARRAY['2099/10083','Fake Voter 83','fakevoter83@test.com'],
    ARRAY['2099/10084','Fake Voter 84','fakevoter84@test.com'],
    ARRAY['2099/10085','Fake Voter 85','fakevoter85@test.com'],
    ARRAY['2099/10086','Fake Voter 86','fakevoter86@test.com'],
    ARRAY['2099/10087','Fake Voter 87','fakevoter87@test.com'],
    ARRAY['2099/10088','Fake Voter 88','fakevoter88@test.com'],
    ARRAY['2099/10089','Fake Voter 89','fakevoter89@test.com'],
    ARRAY['2099/10090','Fake Voter 90','fakevoter90@test.com'],
    ARRAY['2099/10091','Fake Voter 91','fakevoter91@test.com'],
    ARRAY['2099/10092','Fake Voter 92','fakevoter92@test.com'],
    ARRAY['2099/10093','Fake Voter 93','fakevoter93@test.com'],
    ARRAY['2099/10094','Fake Voter 94','fakevoter94@test.com'],
    ARRAY['2099/10095','Fake Voter 95','fakevoter95@test.com'],
    ARRAY['2099/10096','Fake Voter 96','fakevoter96@test.com'],
    ARRAY['2099/10097','Fake Voter 97','fakevoter97@test.com'],
    ARRAY['2099/10098','Fake Voter 98','fakevoter98@test.com'],
    ARRAY['2099/10099','Fake Voter 99','fakevoter99@test.com'],
    ARRAY['2099/10100','Fake Voter 100','fakevoter100@test.com']
  ];
  m TEXT[];
BEGIN
  FOREACH m SLICE 1 IN ARRAY fake_nominators LOOP
    INSERT INTO award_nominations
      (award_category_id, award_category_name, nominee_name, nominator_name, nominator_email, nominator_matric)
    VALUES
      -- Innovation
      ('c412b46d-272f-41f4-8f35-513c2bbfd51a','Brand of the Year','Biebarh Cosmetics',m[2],m[3],m[1]),
      ('0a7710cd-32b2-4865-a11b-a68dafe21ada','Innovation of the Year','Jhommy',m[2],m[3],m[1]),
      ('e5785f1d-1881-4bda-9180-094a44d0af38','Entrepreneur of the Year','Ama',m[2],m[3],m[1]),
      -- Social
      ('0b6da0b0-6a53-40df-9184-69823b068cab','Freshest Fresher of the Year','Bambam',m[2],m[3],m[1]),
      ('6108b578-a06d-4650-bfaf-e975e9b09097','Most Fashionable (Female)','Temidun',m[2],m[3],m[1]),
      ('ddffcdf6-a5f8-4080-9313-6f05bba0deb1','Most Fashionable (Male)','Nil',m[2],m[3],m[1]),
      ('8ed024be-47db-4e91-bda1-ed9d4315a50a','Rookie of the Year','Agu Emmanuella',m[2],m[3],m[1]),
      ('55f54744-6ceb-4a94-b8ef-6457646ad2ca','Most Influential (Female)','Kiki',m[2],m[3],m[1]),
      ('d8718b0c-a87e-4850-b1ab-b97f11c07690','Most Influential (Male)','Faborode Olamide Isaac',m[2],m[3],m[1]),
      ('566506e7-0a64-4164-85da-8a4cced1727a','Most Popular (Male)','Erifoluwa Daniel Olufemi',m[2],m[3],m[1]),
      ('18fa923d-ee61-4928-8abc-9737d5d602ea','Most Popular (Female)','Esther Vp',m[2],m[3],m[1]),
      ('c65bf490-2970-4ad8-a071-5f918c42e460','Spotlight Award','Mario',m[2],m[3],m[1]),
      ('57036265-c7c3-4f31-a19e-467c448e0e1e','Most Sociable (Male)','Justin',m[2],m[3],m[1]),
      ('768ac2ec-62e3-44c8-b9e1-8d17564e59a4','Most Sociable (Female)','Feyi Akinkanju',m[2],m[3],m[1]),
      ('325f0911-4c94-4c70-9ee2-da1d8aa0e4f1','Clique of the Year','Jhommy',m[2],m[3],m[1]),
      -- Entertainment
      ('51795c91-27c7-4f61-a721-69201a740f48','Talent of the Year','Nil',m[2],m[3],m[1]),
      ('233ec654-5251-4d66-bb68-bdf3d360cdae','Content Creator of the Year','Otu Sophia',m[2],m[3],m[1]),
      ('1597d2a6-e3f1-4f03-a8a2-b7beb7b56c7a','Artiste of the Year','Tikayhex',m[2],m[3],m[1]),
      ('fb443fe0-28a3-4a1e-a626-22e47ce4e31b','DJ / Music Producer of the Year','Dj Gecho',m[2],m[3],m[1]),
      ('b9b6217d-fd78-4214-b075-3a913892e8c7','Icon 360','Mario',m[2],m[3],m[1]),
      ('8e229c45-48e3-4573-aa30-efe6f6b8eaaf','Next Rated','Ace',m[2],m[3],m[1]),
      -- Sports
      ('d5537cdf-6281-4bf1-b0d9-3d183521aab5','Sports Personality (Male)','Arab',m[2],m[3],m[1]),
      ('d30dbaca-f375-4bdc-976c-b636fbda1287','Sports Personality (Female)','Nil',m[2],m[3],m[1]),
      ('3af04d04-e697-4412-b798-d23f1c81a906','Footballer of the Year (Male)','Enoch Adeboye',m[2],m[3],m[1]),
      ('221bff77-be12-43a3-a07f-dda9e17b5125','Footballer of the Year (Female)','Ruth',m[2],m[3],m[1]),
      ('90370d5c-94a6-4850-91f1-2be7608bbebe','Basketball Player of the Year (Female)','Becky',m[2],m[3],m[1]),
      ('349a515c-68f7-4569-94f5-818df66ef4b8','Basketball Player of the Year (Male)','Ted',m[2],m[3],m[1]),
      -- Creative
      ('e44c8f09-bae8-440f-b52f-b312a4d5f0ee','Graphic Designer of the Year','Niffy Graphics',m[2],m[3],m[1]),
      ('bbbe3f22-78e1-4e20-9b25-8a23360a7fcb','Videographer of the Year','Jay',m[2],m[3],m[1]),
      ('202255e3-b09f-4220-adaa-5a4ea104a868','Photographer of the Year','Mofe',m[2],m[3],m[1]),
      -- Leadership
      ('c96de374-04bb-4130-bc37-f6d3fe2e4964','Academic Excellence Award','Miji Caleb',m[2],m[3],m[1]),
      ('b56ce9c4-556e-4726-86dc-f8709a86d121','Most Outstanding Student of the Year','Aisosa',m[2],m[3],m[1]),
      ('e6da2ed3-8374-4d8e-ae52-e9e6d4a2c999','Distinguished Executive (Female)','Temidun',m[2],m[3],m[1]),
      ('4a875b8b-93a5-4eba-81fa-66153770d74c','Distinguished Executive (Male)','Nil',m[2],m[3],m[1]),
      ('6840be15-7a36-429b-97ec-84138c80178c','Lecturer of the Year','Dr Sangola',m[2],m[3],m[1]);
  END LOOP;
END $$;

-- ============================================================
-- To clean up fake data after testing:
-- DELETE FROM award_nominations WHERE nominator_matric LIKE '2099/%';
-- ============================================================
