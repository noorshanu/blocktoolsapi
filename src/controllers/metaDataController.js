

const { sendErrorResponse } = require("../helpers");
const { MetaData } = require("../models");
const Li_Project = require("../models/liProject.model");
const { createMetadata } = require("../utils/metaDataUtils");

module.exports = {
    createMetadata : async (req, res) => {
        try {
         
            const {projectId,ownerWallet,userId} = req.body;
            if (!userId && !ownerWallet) {
              return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
            }
            const query = userId ? { user: userId } : { ownerWallet };
            const user = await User.findOne(query);
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }
            const projectDetails = await Li_Project.findById(projectId);

            if (!projectDetails) {
                return sendErrorResponse(res, 404, "Project not found");
              }

              const {
                tokenImage:filename,
                tokenName: name,
                tokenSymbol: symbol,
                tokenDesc: description,
                twitterUrl: twitter,
                telegramUrl: telegram,
                websiteUrl: website,
                  
              } = projectDetails;
        
              
              console.log(filename);
              
              const metaData = await createMetadata(
                filename,
                name,
                symbol,
                description,
                twitter,
                telegram,
                website
              );
            
              console.log(metaData);
              
              

            // const newMetaData = new MetaData({
            //     tokenName,
            //     tokenSymbol,
            //     imageFileName,
            //     telegramUrl,
            //     twitterUrl,
            //     websiteUrl,
            //     description,
            //     tokenAddress,
            //     tokenMintKey,
            //     mintAuthority,
            //     bondingCurve,
            //     associatedBondingCurce,
            //     metadata,
            //     eventAuthority,
            //     slippagePctg,
            //     lookupTableAddress,
            //   });
        
             
            //   await newMetaData.save();
        
              
              res.status(201).json({
                message: "Metadata created successfully",
                metaData
              });

        } catch (err) {
          sendErrorResponse(res, 500, err);
        }
      },
}