const SCORE_DATASOURCE = [
    {
        text: '1分',
        value: 1
    },
    {
        text: '2分',
        value: 2
    }
];

export default SCORE_DATASOURCE;

export function initDatasource () {
    const originDataSource: any[][] = []
    let scoreMData = new Array(60).fill({text: 1, value: 1});
    scoreMData = scoreMData.map((e, index) => { 
        return { text: index, value: index}
    });
    let scoreSData = new Array(999).fill({text: 1, value: 1});
    scoreSData = scoreSData.map((e, index) => { 
        return { text: index, value: index}
    });
    originDataSource.push(SCORE_DATASOURCE)
    originDataSource.push(scoreMData)
    originDataSource.push(scoreSData)
    return originDataSource
}