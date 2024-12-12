const fs = require('fs');
const path = require('path');

module.exports = {
    createMetadata : async (
        filename,
        name,
        symbol,
        description,
        twitter,
        telegram,
        website,
        ) => {
        const filePath = path.join(__dirname, '..', '..',  filename);

        const fileContent = fs.readFileSync(filePath);
        const contentType = "image/png"
        const fileBlob = new Blob([fileContent], { type: contentType });
     
        var myHeaders = new Headers();
         var formdata = new FormData();
        formdata.append("file", fileBlob, symbol+'.png');
        formdata.append("name", name);
        formdata.append("symbol",symbol);
        formdata.append("description", description);
        formdata.append("twitter",  twitter);
        formdata.append("telegram",   telegram);
        formdata.append("website",   website);
        formdata.append("showName", 'true');
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata
        }; 
        const result = await fetch("https://pump.fun/api/ipfs", requestOptions)
            .then(response => response.json())
            .catch(error => console.log('error', error));
     
        console.log(result);
        return result.metadataUri;
    }
}

