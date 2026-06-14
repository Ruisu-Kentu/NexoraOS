-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2026 at 04:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nexoraos`
--

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `folder_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `name`, `content`, `deleted`, `folder_id`, `created_at`) VALUES
(2, 'Test', 'the quick brown fox jumps over the lazy dog', 0, 0, '2026-03-22 02:05:23'),
(3, 'hello.txt', 'Hello World', 0, 0, '2026-03-22 02:07:28'),
(4, 'blabla.txt', '', 0, 0, '2026-03-22 02:12:28'),
(6, 'rawr', 'Hello rawr\n', 0, 0, '2026-03-22 02:56:31'),
(14, 'wat da hel?', 'wat da helly?\n', 0, 0, '2026-03-22 04:15:09'),
(15, 'Copy of wat da hellyish?', 'wat da helly?\n', 0, 0, '2026-03-22 04:18:51'),
(20, 'ganyan ba boses ng nagtatanong maem.jpg', '69c3d84a3f0d4_ganyan ba boses ng nagtatanong maem.jpg', 0, 1, '2026-03-25 12:42:50'),
(21, 'orange pussy.jpg', '69c3d86f66f4a_orange cat.jpg', 0, 1, '2026-03-25 12:43:27'),
(22, 'ohaha.webp', '69c519d79b120_ohaha.webp', 0, 3, '2026-03-26 11:34:47'),
(28, 'ganyan ba boses ng nagtatanong maem.jpg', '69cdebfc7c0e9_ganyan ba boses ng nagtatanong maem.jpg', 0, 11, '2026-04-02 04:09:32'),
(36, 'Call me baby', 'hey i just met you. But this is CRAZYYYY. But here\'s my number. So call me baby. Wewes. HAHAHAHAHAHHAH', 0, NULL, '2026-04-02 04:35:23'),
(37, 'pixel1.png', '69cdf3123a8ba_pixel1.png', 0, 10, '2026-04-02 04:39:46'),
(38, 'orange cat.jpg', '69cdf31c82a92_orange cat.jpg', 0, 8, '2026-04-02 04:39:56'),
(40, 'ghost.jpg', '69cdf33539b1c_ghost.jpg', 0, 2, '2026-04-02 04:40:21'),
(42, 'ganyan ba boses ng nagtatanong maem.jpg', '69cdf64a5dbc8_ganyan ba boses ng nagtatanong maem.jpg', 0, 8, '2026-04-02 04:53:30'),
(43, 'orange cat.jpg', '69cdf64ea6a76_orange cat.jpg', 0, 10, '2026-04-02 04:53:34'),
(45, 'sunset.jpg', '69cf77a59259a_sunset.jpg', 0, 14, '2026-04-03 08:17:41'),
(49, 'patrick-star-internet-meme-doge-pepe-the-frog-meme.jpg', '69f1778eec19f_patrick-star-internet-meme-doge-pepe-the-frog-meme.jpg', 0, 11, '2026-04-29 03:14:22'),
(51, 'lowsasasds', 'asdadasd', 0, NULL, '2026-04-29 04:14:28'),
(52, 'wmremove-transformed (1).png', '69f185af87a35_wmremove-transformed (1).png', 0, 1, '2026-04-29 04:14:39'),
(61, 'newtestv1', 'the quick brown fox jumps over the lazy dog', 0, NULL, '2026-05-02 15:28:27'),
(62, 'aa', '<b><i>PPPPPPP</i></b>', 0, NULL, '2026-05-02 15:41:13');

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE `folders` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL,
  `is_desktop` tinyint(1) NOT NULL,
  `position_x` int(11) NOT NULL DEFAULT 120,
  `position_y` int(11) NOT NULL DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `folders`
--

INSERT INTO `folders` (`id`, `name`, `parent_id`, `deleted`, `is_desktop`, `position_x`, `position_y`, `created_at`) VALUES
(1, 'My Folder', NULL, 0, 0, 120, 100, '2026-03-25 12:42:07'),
(2, 'hehe', NULL, 0, 0, 120, 100, '2026-03-25 12:43:12'),
(3, 'Test', NULL, 0, 0, 120, 100, '2026-03-26 11:33:19'),
(8, 'JAJA', 1, 0, 0, 120, 100, '2026-03-26 14:56:57'),
(9, 'New Folder', NULL, 0, 0, 120, 100, '2026-03-26 14:58:06'),
(10, 'Wat da?', 8, 0, 0, 120, 100, '2026-03-31 10:33:42'),
(11, 'haha', NULL, 0, 0, 120, 100, '2026-04-02 04:09:24'),
(14, 'Seans', NULL, 0, 0, 120, 100, '2026-04-03 08:17:23'),
(63, 'Wews', 1, 0, 0, 120, 100, '2026-04-29 03:08:29'),
(65, 'WAWAWA', NULL, 0, 0, 120, 100, '2026-04-29 04:16:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2026-03-31 11:48:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
