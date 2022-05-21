const axios = require('axios');
const _ = require('lodash');
const { ethers } = require('ethers');
const moment = require('moment');

export const getMyGotchis = async(owner, installationDiamondContract, realmDiamondContract) => {
  const unlentGotchis = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: `{
        aavegotchis(
          first: 1000,
          skip: 0,
          where: {
            status: 3,
            owner: "${owner}"
          }
        ) {
          id
          name
          kinship
        }
      }`
    }
  );

  let gotchisData = [];
  for (let i = 0; i < unlentGotchis.data.data.aavegotchis.length; i++) {
    let a = unlentGotchis.data.data.aavegotchis[i];
    a.kinship = parseInt(a.kinship);
    a.lastChanneledUnix = await realmDiamondContract.getLastChanneled(parseInt(a.id));
    a.lastChanneledRelative = '';
    a.channelable = false;

    if (a.lastChanneledUnix != 0) {
      let duration = moment.duration(moment().diff(moment.unix(a.lastChanneledUnix)));
      a.lastChanneledRelative = `${parseInt(duration.asHours())} hours and ${parseInt(duration.asMinutes()) % 60} mins ago`;
    }

    let lastChanneledDay = Math.floor(a.lastChanneledUnix / (60 * 60 * 24));
    let currentDay = Math.floor(moment().unix() / (60 * 60 * 24));
    if (lastChanneledDay != currentDay) {
      a.channelable = true;
    }

    gotchisData.push(a);
  }

  gotchisData = _.orderBy(gotchisData, ['kinship'], ['desc']);

  console.log('getMyGotchis', gotchisData);

  return gotchisData;
};
