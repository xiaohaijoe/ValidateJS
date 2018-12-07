import Validate from '../util/validate'

class Test {

    // 任何时候，都可以使用Validate类进行独立的验证操作，例如：
    static test() {
        let validate = new Validate([
            ['name', 'require|max:25'],
            ['email', 'email']
        ]);

        let data = {
            'name': 'hello world',
            'email': 'hijack@xiaohaijoe.com'
        }
        if (!validate.check(data)) {
            console.log(validate.getError());
        }
        data = {}
        if (!validate.check(data)) {
            console.log(validate.getError());
        }
    }

    static rule() {
        // 规则定义支持下面两种方式：
        // 对于一个字段可以设置多个验证规则，使用|分割。
        let rule = [
            ['name', 'require|max:25'],
            ['email', 'email']
        ]
        let validate = new Validate(rule);
        // 或者采用数组方式定义多个规则（适用于你的验证规则中有|的情况）
        rule = [
            ['name', ['require', 'max:25']],
            ['email', 'email']
        ]
        validate = new Validate(rule)
        let data = {
            'name': 'hello world',
            'email': 'hijack@xiaohaijoe.com'
        }
        if (!validate.check(data)) {
            console.log(validate.getError());
        }
    }

    static message() {
        let rules = [
            ['name', 'require|max:25'],
            ['age|年龄', 'number|between:1,120'],
            ['email', 'email'],
        ];
        let msg = [
            ['name.require', '名称必须'],
            ['name.max', '名称最多不能超过25个字符'],
            ['age.number', '年龄必须是数字'],
            ['age.between', '年龄只能在1-120之间'],
            ['email', '邮箱格式错误'],
        ];
        let validate = new Validate(rules,msg)
        let data = {
            'name': 'hello world',
            'age': 125,
            'email': 'validate@xiaohaijoe.com'
        }
        if (!validate.check(data)) {
            console.log(validate.getError())
        }

    }

    static message2() {
        let rules = [
            ['name', 'require|max:25', '姓名不能为空|名称不能超过25个字符'],
            ['age', 'number|between:1,120', '年龄必须是数字'],
        ]
        let validate = new Validate(rules);
        let data = {
            'name': 'hello world',
            'age': 20,
            'email': 'validate@xiaohaijoe.com'
        }
        if (!validate.check(data)) {
            console.log(validate.getError())
        }
    }

    // 自定义规则
    static customRule() {
        let rule = [
            ['name', ['require', Test.checkName]]
        ];
        let validate = new Validate(rule);
        let data = {
            'name': 'hello',
        };
        if (!validate.check(data)) {
            console.log(validate.getError())
        }
    }

    static checkName(name) {
        if (name.length > 25) {
            return true
        }
        return false
    }

    // 静态调用
    static staticValidate() {
        // let validate = new Validate();
        console.log(Validate.is('thinkphp@qq.com', 'email'));
        console.log(Validate.is('2016-jj-03', 'date'));
        console.log(Validate.in('a', ['a', 'b', 'c']));
        console.log(Validate.gt(10, 8));
    }

    // 格式验证
    static formatValidate() {
        // 验证某个字段必须，例如：
        // let rule = [['name','require']];
        // 验证某个字段的值是否为数字
        // let rule = [['num','number']];
        // 验证某个字段的值是否为email地址，例如：
        // let rule = [['email','email']];
        // 验证某个字段的值是否为浮点数字
        // let rule = [['num','float']];
        // 验证某个字段的值是否为布尔值
        // let rule = [['num','boolean']];
        // 验证某个字段的值是否为数组，例如：
        // let rule = [['info','array']];
        // 验证某个字段是否为为 yes, on, 或是 1。这在确认"服务条款"是否同意时很有用，例如：
        // let rule = [['accept','accepted']];
        // 验证值是否为有效的日期，例如：
        // let rule = [['date','date']];
        // 验证某个字段的值是否为字母，例如：
        // let rule = [['name','alpha']];
        // 验证某个字段的值是否为字母和数字，例如：
        // let rule = [['name','alphaNum']];
        // 验证某个字段的值是否为字母和数字，下划线_及破折号-，例如：
        // let rule = [['name','alphaDash']];
        // 验证某个字段的值只能是汉字，例如：
        // let rule = [['name','chs']];
        // 验证某个字段的值只能是汉字、字母，例如：
        // let rule = [['name','chsAlpha']];
        // 验证某个字段的值只能是汉字、字母和数字，例如：
        // let rule = [['name','chsAlphaNum']];
        // 验证某个字段的值只能是汉字、字母、数字和下划线_及破折号-，例如：
        // let rule = [['name','chsDash']];
    }

    // 长度和区间验证类
    static rangeValidate() {
        // 验证某个字段的值是否在某个范围，例如：
        // let rule = [['num', 'in:1,2,3']];
        // 验证某个字段的值不在某个范围，例如：
        // let rule = [['num', 'notIn:1,2,3']];
        // 验证某个字段的值是否在某个区间，例如：
        // let rule = [['num', 'between:1,10']];
        // 验证某个字段的值不在某个范围，例如：
        // let rule = [['num', 'notBetween:1,10']];
        // 验证某个字段的值的长度是否在某个范围，例如：
        // let rule = [['num', 'len:4,25']];
        // 或者指定长度
        // let rule = [['num', 'len:4']];
        // 验证某个字段的值的最大长度，例如：
        // let rule = [['num', 'max:25']];
        // 验证某个字段的值的最小长度，例如：
        // let rule = [['num', 'min:5']];
    }

    // 字段比较类
    static compareValidate() {
        // 验证某个字段是否和另外一个字段的值一致，例如：
        // let rule = [['repassword', 'require|confirm:password']];
        // let data = {
        //     'password': '123456',
        //     'repassword': '1234567',
        // };
        // let validate = new Validate(rule)
        // if(!validate.check(data)){
        //     console.log(validate.getError());
        // }


        // 验证某个字段是否和另外一个字段的值不一致，例如：
        // let rule = [['name', 'require|different:account']];
        // 验证是否等于某个值，例如：
        // let rule = [['score', 'eq:100']];
        // let rule = [['num', '=:100']];
        // let rule = [['num', 'same:100']];
        // 验证是否大于等于某个值，例如：
        // let rule = [['score', 'egt:60']];
        // let rule = [['num', '>=:100']];
        // 验证是否大于某个值，例如：
        // let rule = [['num', 'gt:60']];
        // let rule = [['num', '>:100']];
        // 验证是否小于等于某个值，例如：
        // let rule = [['num', 'elt:100']];
        // let rule = [['num', '<=:100']];
        // 验证是否小于某个值，例如：
        // let rule = [['num', 'lt:100']];
        // let rule = [['num', '<:100']];
        // 验证对比其他字段大小（数值大小对比），例如：
        // let rule = [['price', 'lt:market_price']];
        let rule = [['price', '<:market_price']];
        let data = {
            'price': 123,
            'market_price': 23,
        };
        let validate = new Validate(rule)
        console.log(validate.check(data));
        console.log(validate.getError());
    }

    static regexpValidate(){

        let data = {
          'name': 'ffff ',
        };
        // 如果正则中包含"|"符号，必须使用数组模式定义规则
        // let rule = [['name', ['require','/^\\w+\\s+|\\d+$/i']]];
        let rule = [['name', 'require|\\w+\\s+']];
        let validate = new Validate(rule);
        console.log(validate.check(data));
        console.log(validate.getError());

        // 静态调用
        // console.log(Validate.regex(data.name, /^\\s*|\\d*$/));
    }

    static test(){
        let data={
            username: '',
            mobile: '13728811363',
            password: '',
            rePassword: '',
        }
        let rule = [['mobile|手机号','require|len:11|number']];
        let validate = new Validate(rule);
        validate.check(data);
        console.log(validate.getError());

    }
}

Test.test();