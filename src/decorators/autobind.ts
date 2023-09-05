    // 자동 bind 데코레이터
    export function 자동바인드(_: any, _2: string, descriptor: PropertyDescriptor) {
    
        const 기존메서드 = descriptor.value;
        const 조정된Dec:PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = 기존메서드.bind(this);
            return boundFn;
        }
        }
        return 조정된Dec;
    }
