const activities = [
    "Mengerjakan tugas dari pembimbing industri",
    "Membantu pekerjaan di tempat PKL",
    "Mengerjakan proyek pengembangan sistem",
    "Membantu pengelolaan data perusahaan",
    "Melakukan maintenance perangkat komputer",
    "Mengerjakan desain dan dokumentasi",
    "Membantu instalasi dan konfigurasi sistem",
    "Mengerjakan tugas administrasi teknis",
    "Melakukan pengujian aplikasi",
    "Membantu pengembangan fitur website",
    "Mengerjakan laporan harian PKL",
    "Membantu troubleshooting jaringan",
    "Mengerjakan database management",
    "Membantu pembuatan konten digital",
    "Melakukan analisis kebutuhan sistem"
];

function getRandomActivity() {
    return activities[Math.floor(Math.random() * activities.length)];
}

function getRandomDelay(maxMinutes = 15) {
    const minutes = Math.floor(Math.random() * maxMinutes);
    const seconds = Math.floor(Math.random() * 60);
    return (minutes * 60 + seconds) * 1000;
}

module.exports = {
    getRandomActivity,
    getRandomDelay,
    activities
};
