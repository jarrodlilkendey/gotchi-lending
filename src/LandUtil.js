const axios = require('axios');
const _ = require('lodash');
const { ethers } = require('ethers');
const moment = require('moment');

export const getMyLand = async(owner, installationDiamondContract, realmDiamondContract) => {
  console.log('installationDiamondContract', installationDiamondContract);

  const sizes = ['Humble', 'Reasonable', 'Spacious', 'Spacious', 'Partner'];
  const aaltarCooldowns = [24, 18, 12, 8, 6, 4, 3, 2, 1];

  const parcels = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: `{
        parcels(
          first: 1000,
          where: {
            owner: "${owner}"
          },
          orderBy: district,
          orderDirection:asc
        ) {
          id
          district
          parcelHash
          size
        }
      }`
    }
  );

  let parcelsData = [];
  for (let i = 0; i < parcels.data.data.parcels.length; i++) {
    let p = parcels.data.data.parcels[i];
    p.district = parseInt(p.district);
    p.size = sizes[parseInt(p.size)];
    p.installationBalancesOfToken = await installationDiamondContract.installationBalancesOfToken("0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11", p.id);
    p.hasAltar = false;
    p.altarLevel = 0;
    p.altarCooldown = 0;
    p.isChannelable = false;
    for (let j = 0; j < p.installationBalancesOfToken.length; j++) {
      let installationId = p.installationBalancesOfToken[j].installationId.toNumber();
      let balance = p.installationBalancesOfToken[j].balance.toNumber();
      console.log(p.parcelHash, 'id:', installationId, 'bal:', balance);

      if (balance > 0 && installationId >= 1 && installationId <= 19) {
        p.hasAltar = true;
        if (installationId >= 1 && installationId <= 9) {
          p.altarLevel = installationId;
          p.altarCooldown = aaltarCooldowns[p.altarLevel-1];
        } else {
          p.altarLevel = installationId - 9;
          p.altarCooldown = aaltarCooldowns[p.altarLevel-1];
        }
      }
    }
    p.lastAltarChannel = 0;
    p.lastAltarChannelRelative = "";
    if (p.hasAltar) {
      p.lastAltarChannel = await realmDiamondContract.getParcelLastChanneled(p.id);
      if (p.lastAltarChannel != 0) {
        p.lastAltarChannelRelative = moment.unix(p.lastAltarChannel).fromNow();
        let diffHours = moment().diff(moment.unix(p.lastAltarChannel), 'hours');
        if (diffHours >= p.altarCooldown) {
          p.isChannelable = true;
        }
      } else {
        p.isChannelable = true;
      }
    }
    parcelsData.push(p);
  }

  return parcelsData;
};
