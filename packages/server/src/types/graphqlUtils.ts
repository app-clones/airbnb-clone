export interface ResolverMap {
    [key: string]: {
        [key: string]: (_: any, args: any, context: {}, info: any) => any;
    };
}
