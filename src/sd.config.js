//Figma Token Plugin을 활용하여 CSS의 컬러 컴포넌트화를 돕는 코드. 현재는 활용 여부가 확실하지 않음
import 'style-dictionary';
const StyleDictionary = require('style-dictionary').extend({
    source: ['tokens/**/*.json'],
    platforms: {
        scss: {
            transformGroup: 'css',
            buildPath: 'src/styles/css/', //변환한 파일을 저장할 경로
            files: [
                {
                    format: 'css/variables',
                    destination: '_variables.css',//파일명
                },
            ],
        },
    },
});
StyleDictionary.buildAllPlatforms();