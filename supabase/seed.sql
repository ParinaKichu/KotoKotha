-- ============================================================
-- KotoKotha — Sample Data
-- Run this AFTER schema.sql.
-- 12 fictional posts (all approved) for demo purposes.
-- ============================================================

INSERT INTO posts (title, category, institution, division, district, rating, body, approved, upvotes, downvotes, created_at) VALUES

('Waited 4 hours at the OPD counter',
 'Hospital', 'Shadhinota General Hospital', 'Dhaka', 'Dhaka', 2,
 'Went for a simple blood test referral. The token system was completely manual — handwritten slips. After 4 hours I finally saw the doctor for about 3 minutes. Medicine counter had only half the prescribed drugs. The staff were polite though, so that was nice.',
 true, 34, 5, '2026-10-02 09:15:00+06'),

('লাইব্রেরিতে বই নেই, শুধু খালি তাক',
 'Education', 'অগ্রদূত সরকারি কলেজ', 'Rajshahi', 'Rajshahi', 1,
 'কলেজের লাইব্রেরি আছে কিন্তু বই নেই বললেই চলে। গত ৫ বছরে নতুন কোনো বই কেনা হয়নি। শিক্ষার্থীরা নিজেরাই টাকা তুলে কিছু বই কিনেছে। কর্তৃপক্ষ কোনো উদ্যোগ নেয়নি।',
 true, 78, 3, '2026-09-18 14:30:00+06'),

('CNG auto-r driver eto beshi bhara nilo!',
 'Transport', 'Chittagong City CNG Stand', 'Chittagong', 'Chittagong', 2,
 'Agrabad theke GEC more jete meter e 80 taka howar kotha, kintu driver 200 taka chaise. Complain korte gele bole "ato raat e rate beshi lage". Kono authority nai dekhar. Meter ache but chalu kore na.',
 true, 45, 12, '2026-10-10 22:45:00+06'),

('Electricity bill correction took 3 months',
 'Utility', 'Khulna BPDB Regional Office', 'Khulna', 'Khulna', 2,
 'My meter was faulty and gave a bill of 12,000 taka for a single room. I submitted a complaint with photos and the old bills. They took exactly 3 months, 4 visits, and 2 written applications to fix it. Finally corrected, but no apology or compensation.',
 true, 22, 1, '2026-08-25 11:00:00+06'),

('জন্ম নিবন্ধন অনলাইনে করলাম — ভালো অভিজ্ঞতা!',
 'Government Office', 'বরিশাল সিটি কর্পোরেশন', 'Barishal', 'Barishal', 5,
 'অনলাইনে আবেদন করে ৭ দিনের মধ্যে জন্ম সনদ পেয়ে গেছি। আগে ইউনিয়ন পরিষদে গিয়ে ৩ মাস লেগে যেত। ডিজিটাল সিস্টেম সত্যিই কাজ করছে এখানে। ধন্যবাদ কর্মীদের।',
 true, 112, 2, '2026-11-01 16:20:00+06'),

('Bank er line e 2 ghonta, just ekta form er jonno',
 'Bank', 'Surma Nationalized Bank, Sylhet Branch', 'Sylhet', 'Sylhet', 1,
 'Account kholte giyechi. Bola holo 3ta form fill up koren, photocopy den, NID er copy den. Shob disi. Tarpor bole aro 1ta form lagbe, seta abar alada counter e. Total 2 ghonta pore bole "ajke system down, kalke ashen." Seriously?',
 true, 91, 8, '2026-10-15 10:30:00+06'),

('Free eye camp was genuinely helpful',
 'Hospital', 'Shishu Alo Eye Foundation Camp', 'Rangpur', 'Rangpur', 5,
 'An NGO set up a free eye camp near the Rangpur town hall. They tested over 200 people in a single day. My grandmother got free reading glasses on the spot. Volunteers were students from the local medical college. Well organized, no chaos.',
 true, 150, 4, '2026-09-05 08:00:00+06'),

('Teacher onek bhalo but classroom e fan nai',
 'Education', 'Noboborsho Model School', 'Mymensingh', 'Mymensingh', 3,
 'Amader school er teacher ra shotti dedicated. Kintu classroom e 1ta fan 40 jon student er jonno. Summer e class kora impossible. Management ke bolle bole "budget nai". Boi er quality bhalo, khata free dey, but infrastructure worst.',
 true, 60, 15, '2026-07-20 13:00:00+06'),

('মেট্রোরেল — ঢাকার সেরা জিনিস এখন',
 'Transport', 'ঢাকা মেট্রোরেল (MRT-6)', 'Dhaka', 'Dhaka', 5,
 'উত্তরা থেকে মতিঝিল ৩৫ মিনিটে! আগে বাসে ২ ঘণ্টা লাগত। পরিষ্কার, শীতাতপ নিয়ন্ত্রিত, সময়মতো আসে। টিকিটের দামও যুক্তিসঙ্গত। শুধু ভিড়ের সময় একটু কষ্ট হয়, কিন্তু তবুও বাসের চেয়ে ১০০ গুণ ভালো।',
 true, 203, 10, '2026-11-10 07:50:00+06'),

('Passport office experience was surprisingly smooth',
 'Government Office', 'Regional Passport Office, Chittagong', 'Chittagong', 'Chittagong', 4,
 'Applied online, got an appointment date. Went in, did biometrics in 20 minutes. Got the passport delivered by post within 15 working days. The only issue was the waiting area had no seats — had to stand the whole time. But overall much better than 5 years ago.',
 true, 88, 6, '2026-10-28 09:00:00+06'),

('Pani supply er somossa — din e pani nai, rate ase',
 'Utility', 'Rajshahi WASA', 'Rajshahi', 'Rajshahi', 2,
 'Amader area te shudhu rate 11tar por pani ase, tokhon shobai ghumay. Dine jokhn dorkar, tokhon supply nai. Complaint korlam, bole "line e pressure kom". 6 mash dhore same kotha. Akhon amra nijer deep tube-well boshechi.',
 true, 37, 4, '2026-08-12 19:30:00+06'),

('মোবাইল ব্যাংকিং-এ টাকা আটকে গেছে ৫ দিন',
 'Bank', 'ডিজিটাল টাকা ব্যাংক (কাল্পনিক)', 'Dhaka', 'Gazipur', 1,
 'মোবাইল অ্যাপ দিয়ে ৫,০০০ টাকা পাঠাচ্ছিলাম, মাঝপথে অ্যাপ ক্র্যাশ করেছে। টাকা আমার অ্যাকাউন্ট থেকে কেটে গেছে কিন্তু প্রাপক পায়নি। হেল্পলাইনে কল দিয়ে প্রতিদিন ৪৫ মিনিট ধরে রাখে। ৫ দিন পরে টাকা ফেরত এসেছে, কিন্তু কোনো ক্ষতিপূরণ নেই।',
 true, 55, 7, '2026-11-05 20:15:00+06');
