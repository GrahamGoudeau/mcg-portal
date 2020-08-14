function getContactEmail() {
    // obfuscated to keep bots from crawling github and getting this email address
    return atob('c131J1h1c1H1B1A1b1W1F1u1Y121h1l1c131R1l1c1m1J1p1Z1H1d1l1b1G1w1u1b131J1n1'.split('').filter((_, idx) => idx % 2 === 0).join(''))
}

export default getContactEmail;
