import { retrieveOwnedLentAavegotchis, retrieveOwnerBorrowedAavegotchis } from './LendingUtil';

const axios = require('axios');
const _ = require('lodash');
const { ethers } = require('ethers');
const moment = require('moment');

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

  export const getUnlentAccountGotchisOperatorStatus = async(owner, lendingOperator, aavegotchiDiamond) => {
    owner = owner.toLowerCase();
    
    const gotchis = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: `{
          aavegotchis(
            first: 1000,
            skip: 0,
            where: {
              status: 3,
              owner: "${owner}",
            }
          ) {
            id
            name
            kinship
          }
        }`
      }
    );
   
    const ownedLentGotchis = await retrieveOwnedLentAavegotchis(owner);
    const ownerBorrowedGotchis = await retrieveOwnerBorrowedAavegotchis(owner);
    console.log('retrieveOwnedLentAavegotchis', ownedLentGotchis);
    console.log('retrieveOwnerBorrowedAavegotchis', ownerBorrowedGotchis);
  
    let aavegotchis = [];
    gotchis.data.data.aavegotchis.map((g) => {
      if (!_.find([...ownedLentGotchis, ...ownerBorrowedGotchis], ['gotchi.id', g.id])) {
        aavegotchis.push(g);
      }
    });
  
    let gotchiIds = [];
    for (let i = 0; i < aavegotchis.length; i++) {
      gotchiIds.push(aavegotchis[i].id);
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
  
    for (let i = 0; i < aavegotchis.length; i++) {
      let gotchi = aavegotchis[i];

      aavegotchis[i].isLendingOperator = await aavegotchiDiamond.isLendingOperator(owner, lendingOperator, gotchi.id);
  
      aavegotchis[i].kinship = parseInt(gotchi.kinship);
  
      let channelingData = null;
      if (_.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id]).length > 0) {
        channelingData = _.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id])[0];
        aavegotchis[i].lastChanneledUnix = parseInt(channelingData.lastChanneledAlchemica);
      } else {
        aavegotchis[i].lastChanneledUnix = 0;
      }
  
      aavegotchis[i].channelable = false;
  
      let lastChanneledDay = Math.floor(gotchi.lastChanneledUnix / (60 * 60 * 24));
      let currentDay = Math.floor(moment().unix() / (60 * 60 * 24));
      if (lastChanneledDay != currentDay) {
        aavegotchis[i].channelable = true;
      }
    }
  
    aavegotchis = _.orderBy(aavegotchis, ['kinship'], ['desc']);
  
    console.log('aavegotchis', aavegotchis);
  
    return aavegotchis;
  };