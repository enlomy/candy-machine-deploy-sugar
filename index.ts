import dotenv from "dotenv";
import fs from "fs";
import path from 'path';
dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY!
const PINATA_FILE_URL = process.env.PINATA_FILE_URL!
const PINATA_ORIGIN_URL = process.env.PINATA_ORIGIN_URL!

const pinFileToIPFS = async () => {
    try {

        const formData = new FormData();
        const files = fs.readdirSync('assets');
        const gifFiles = files.filter(file => path.extname(file) === '.gif' && /^\d+$/.test(path.basename(file, path.extname(file))));

        for (const x in gifFiles) {
            const content = fs.readFileSync(`assets/${x}.gif`)
            const file = new File([content], `assets/${x}.gif`, { type: "image/gif" });
            formData.append("file", file);
        }

        const pinataRequest = await fetch(
            PINATA_FILE_URL,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${PINATA_API_KEY}`,
                },
                body: formData,
            }
        );
        const pinataData: any = await pinataRequest.json()
        return PINATA_ORIGIN_URL + pinataData.IpfsHash
    } catch (error) {
        console.log(error);
    }
}

const main = async () => {
    try {
        const pinataUrl = await pinFileToIPFS()
        console.log('pinataUrl', pinataUrl)
    } catch (error) {
        console.log(error);
    }
}

main()