const region = 'us-east-1';
const bucketName = 'agora-rec123'
const accessKeyId = 'AKIAQQSU2AXEXZ3UOWLY';
const secretAccessKey = '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';

const AWS = require('aws-sdk');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;


AWS.config.update({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, region: region });
var s3 = new AWS.S3();

const fn = async (params) => {
    let arr = [];
    let list = await s3.listObjects(params).promise();

    let promises = list.CommonPrefixes.map((e) => {
        return s3.listObjects({
            Bucket: 'agora-rec123',
            Delimiter: '/',
            Prefix: e.Prefix
        }).promise();
    })

    let data = await Promise.all(promises);
    data.map(folder => folder.Contents.map(file => {
        if (file.Key.slice(-4) === 'm3u8') {
            arr.push('https://' + params.Bucket + '.s3.' + region + '.amazonaws.com/' + file.Key);
        }
    }));
    return arr;
};

app.get('/:channel', async (req, res) => {
    console.log(req.params.channel);
    var params = {
        Bucket: bucketName,
        Delimiter: '/',
        Prefix: req.params.channel + '/'
    }
    let urls = await fn(params);
    res.send(JSON.stringify(urls));
})

app.get('/', async (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
