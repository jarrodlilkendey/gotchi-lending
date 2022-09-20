const axios = require('axios');
const _ = require('lodash');
const { ethers } = require('ethers');
const moment = require('moment');

export const getMyGotchis = async(owner, installationDiamondContract, realmDiamondContract) => {
  let query = `{
    aavegotchis(
      first: 1000,
      skip: 0,
      where: {
        status: 3,
        owner: "${owner.toLowerCase()}"
      }
    ) {
      id
      name
      kinship
    }
  }`;

  const unlentGotchis = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: query
    }
  );

  let gotchiIds = [];
  for (let i = 0; i < unlentGotchis.data.data.aavegotchis.length; i++) {
    gotchiIds.push(unlentGotchis.data.data.aavegotchis[i].id);
  }

  const gotchiChanneling = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic',
    {
      query: `{
        gotchis(
          first: 1000,
          where: { id_in: [${gotchiIds.join()}] }
        ) {
          id
          lastChanneledAlchemica
        }
      }`
    }
  );

  let gotchisData = [];
  for (let i = 0; i < unlentGotchis.data.data.aavegotchis.length; i++) {
    let a = unlentGotchis.data.data.aavegotchis[i];

    let channelingData = null;
    if (_.filter(gotchiChanneling.data.data.gotchis, ['id', a.id]).length > 0) {
      channelingData = _.filter(gotchiChanneling.data.data.gotchis, ['id', a.id])[0];
      a.lastChanneledUnix = parseInt(channelingData.lastChanneledAlchemica);
    } else {
      a.lastChanneledUnix = 0;
    }

    a.kinship = parseInt(a.kinship);
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


  // let gotchisData = [];
  // for (let i = 0; i < unlentGotchis.data.data.aavegotchis.length; i++) {
  //   let a = unlentGotchis.data.data.aavegotchis[i];
  //   a.kinship = parseInt(a.kinship);
  //   a.lastChanneledUnix = await realmDiamondContract.getLastChanneled(parseInt(a.id));
  //   a.lastChanneledRelative = '';
  //   a.channelable = false;
  //
  //   if (a.lastChanneledUnix != 0) {
  //     let duration = moment.duration(moment().diff(moment.unix(a.lastChanneledUnix)));
  //     a.lastChanneledRelative = `${parseInt(duration.asHours())} hours and ${parseInt(duration.asMinutes()) % 60} mins ago`;
  //   }
  //
  //   let lastChanneledDay = Math.floor(a.lastChanneledUnix / (60 * 60 * 24));
  //   let currentDay = Math.floor(moment().unix() / (60 * 60 * 24));
  //   if (lastChanneledDay != currentDay) {
  //     a.channelable = true;
  //   }
  //
  //   gotchisData.push(a);
  // }

  gotchisData = _.orderBy(gotchisData, ['kinship'], ['desc']);

  console.log('getMyGotchis', gotchisData);

  return gotchisData;
};

export const getAccountGotchisOperatorStatus = async(owner, lendingOperator, aavegotchiDiamond) => {
  let unlentGotchisQuery = `{
    aavegotchis(
      first: 1000,
      skip: 0,
      where: {
        status: 3,
        owner: "${owner.toLowerCase()}"
      }
    ) {
      id
      name
      kinship
    }
  }`;

  const unlentGotchis = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: unlentGotchisQuery
    }
  );

  const lentGotchis = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
    {
      query: `{
        gotchiLendings(where:{ lender: "${owner}", timeAgreed_gt: 0, completed:false, cancelled:false }) {
        gotchi {
          id
          name
        }
      }}`
    }
  );

  console.log('unlentGotchis', unlentGotchis);
  console.log('lentGotchis', lentGotchis);

  let gotchis = [];
  for (let i = 0; i < unlentGotchis.data.data.aavegotchis.length; i++) {
    let a = unlentGotchis.data.data.aavegotchis[i];
    let isLendingOperator = await aavegotchiDiamond.isLendingOperator(owner, lendingOperator, a.id);
    gotchis.push({ id: a.id, name: a.name, isLendingOperator, isLent: false })
  }

  for (let i = 0; i < lentGotchis.data.data.gotchiLendings.length; i++) {
    let a = lentGotchis.data.data.gotchiLendings[i];
    let isLendingOperator = await aavegotchiDiamond.isLendingOperator(owner, lendingOperator, a.gotchi.id);
    gotchis.push({ id: a.gotchi.id, name: a.gotchi.name, isLendingOperator, isLent: true  })
  }

  return gotchis;
};