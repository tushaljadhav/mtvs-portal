USE mtvs;

CREATE TABLE IF NOT EXISTS advertisements (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  description_mr  TEXT,
  phone           VARCHAR(20),
  image_url       VARCHAR(500),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO advertisements (title, description, description_mr, phone, image_url, start_date, end_date, is_active) VALUES
('Patil Bidi Works', 'Authorized distributor for Western Mumbai. Premium hand-rolled bidis & betel leaves.', 'पश्चिम मुंबईचे अधिकृत वितरक. दर्जेदार विडी व खाऊची पाने.', '9820011223', '', '2026-01-01', '2027-12-31', 1),
('Shree Ganesh Tambakhu Mart', 'Wholesale supplier of certified chewing tobacco, pan masala and accessories. Dadar Market.', 'दादर मार्केट मधील प्रमाणित तंबाखू व मसाला घाऊक विक्रेते.', '9821033445', '', '2026-01-01', '2027-12-31', 1),
('Maharashtra Bidi Kamgar Sahakari', 'Welfare society for licensed bidi rollers & union retailers. Subsidized supplies & support.', 'परवानाधारक विडी कामगार व विक्रेत्यांची सहकारी संस्था.', '9822055667', '', '2026-01-01', '2027-12-31', 1),
('Jai Bharat Pan Agency', 'Specialist in export quality betel nuts, lime, kattha & silver foils.', 'उत्कृष्ट दर्जाचे कात, चुना, सुपारी व चांदीचा वर्क.', '9819077889', '', '2026-01-01', '2027-12-31', 1);
