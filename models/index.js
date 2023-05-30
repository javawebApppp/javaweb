const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);


async function createTable(tableName){
    const Model = sequelize.define(
        tableName,
        {
            core : {
                type: Sequelize.STRING(20),
                allowNull : false,
            },
            tesk : {
                type: Sequelize.STRING(20),
                allowNull : false,
            },
            usaged : {
                type:Sequelize.INTEGER.UNSIGNED,
                allowNull:false,
            },
        },
        {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Profile',
            tableName: tableName,
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        }
    );

    await Model.sync();

    return Model;
}

async function createDynamicTable(profile){
    
    const tableName = profile[0][0];
    const DynamicModel = await createTable(tableName);

    let core_row = -1;
    for(let row = 1; row<profile.length; row++){
        if(core_row == -1){
            core_row = row;
            continue;
        }
        if(profile[row].length==1){
            core_row = -1;
            continue;
        }
        for(let column = 1; column < profile[row].length; column++){
            await DynamicModel.create({
                tesk: profile[core_row][column-1],
                core : profile[row][0],
                usaged : profile[row][column],
            });
        }
    }
}

async function getTableList() {
    const query = 'SHOW TABLES'; // 데이터베이스별로 조회 방식이 다를 수 있으므로 사용하는 데이터베이스에 맞는 쿼리를 사용
  
    // 쿼리 실행
    const [results, metadata] = await sequelize.query(query);
  
    // 테이블 목록 추출
    const tableList = results.map((result) => result.Tables_in_javaweb); // 'database'는 실제 사용하는 데이터베이스 이름으로 변경
  
    return tableList;
}


db.sequelize = sequelize;


module.exports = {db, createDynamicTable, sequelize, getTableList};
