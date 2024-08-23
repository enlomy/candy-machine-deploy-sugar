import dotenv from "dotenv";
import fs from "fs";
import path from 'path';
dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY!
const PINATA_FILE_URL = process.env.PINATA_FILE_URL!
const PINATA_ORIGIN_URL = process.env.PINATA_ORIGIN_URL!
const EXT = process.env.EXT!

const pinFileToIPFS = async () => {
    try {

        const formData = new FormData();
        const files = fs.readdirSync('assets');
        const imgFiles = files.filter(file => path.extname(file) === `.${EXT}` && /^\d+$/.test(path.basename(file, path.extname(file))));

        for (const x in imgFiles) {
            const router = `assets/${x}.${EXT}`
            const content = fs.readFileSync(router)
            const file = new File([content], router, { type: `image/${EXT}` });
            formData.append("file", file);
        }

        const router = `assets/collection.${EXT}`
        const content = fs.readFileSync(router)
        const file = new File([content], `assets/collection.${EXT}`, { type: `image/${EXT}` });
        formData.append("file", file);

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
        console.log('pinataUrl:', PINATA_ORIGIN_URL + pinataData.IpfsHash)
        return { pinataUrl: PINATA_ORIGIN_URL + pinataData.IpfsHash, length: imgFiles.length }
    } catch (error) {
        console.log(error);
    }
}

const createMetaData = async (pinataUrl: string, length: number) => {
    const { name, symbol, description, seller_fee_basis_points, external_url } = JSON.parse(fs.readFileSync('constant.json', 'utf-8'))

    try {
        for (let i = 0; i < length; i++) {
            const data = {
                "name": `${name} #${i}`,
                "symbol": symbol,
                "description": description,
                "external_url": external_url,
                "seller_fee_basis_points": seller_fee_basis_points,
                "image": `${pinataUrl}/${i}.${EXT}`,
                "edition": 0,
                "attributes": [
                    {
                        "trait_type": "Skin",
                        "value": "Blue"
                    }
                ],
                "properties": {
                    "files": [
                        {
                            "uri": `${pinataUrl}/${i}.${EXT}`,
                            "type": `image/${EXT}`
                        }
                    ],
                    "category": "image"
                }
            }

            fs.writeFileSync(`assets/${i}.json`, JSON.stringify(data, null, 4))
        }

        const data = {
            "name": `Memecoin Arcade`,
            "symbol": symbol,
            "description": description,
            "seller_fee_basis_points": seller_fee_basis_points,
            "image": `${pinataUrl}/collection.${EXT}`,
            "attributes": [
                {
                    "trait_type": "Skin",
                    "value": "Blue"
                }
            ],
            "properties": {
                "files": [
                    {
                        "uri": `${pinataUrl}/collection.${EXT}`,
                        "type": `image/${EXT}`
                    }
                ],
                "category": "image"
            }
        }
        console.log(`collection: ${pinataUrl}/collection.${EXT}`)
        fs.writeFileSync(`assets/collection.json`, JSON.stringify(data, null, 4))
    } catch (error) {
        console.log(error)
    }
}

const main = async () => {
    try {
        const data = await pinFileToIPFS()
        if (!data) return
        const { pinataUrl, length } = data
        await createMetaData(pinataUrl, length)
    } catch (error) {
        console.log(error);
    }
}

main()