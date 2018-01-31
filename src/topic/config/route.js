/**
 * Created by Arterli on 2016/1/24.
 */
export default [
    [/^index\/(.*)$/, "topic/index/index?order=:1"],
    [/^index$/, "topic/index/index"],
    [/^p\/(.*)$/, "topic/detail/index?id=:1"],
    [/^m\/(.*)$/, "topic/detail/index?id=:1"],
    [/^dlink\/(.*)$/, "topic/detail/downloadgetid?id=:1"],
    [/^keywords\/(.*)$/,"topic/list/keywords?key=:1"],
    [/^topic\/(.*)$/,"topic/keyword/index?key=:1"],
    [/^topic$/,"topic/keyword/index"],
    [/^search$/,"topic/search/index"],
    [/^ajax\/(.*)$/,"topic/ajax?action=:1"],
    [/^t\/(.*)$/,"topic/keyword/list?key=:1"],
    [/^a4f2cde27e70b16ad6c9ae4517122aa4$/,"topic/a4f2cde27e70b16ad6c9ae4517122aa4/index"],
    [/^MP_verify_HhG1tURQGluJn5V0$/,"topic/mp_verify_hhg1turqglujn5v0/index"],
    [/^MP_verify_HhG1tURQGluJn5V0.txt$/,"topic/mp_verify_hhg1turqglujn5v0/index"],
    [/(.*)$/, "topic/index/route?category=:1"],
    // [/^channel\/(.*)$/, "home/topic/index?category=:1"],
    // [/^column\/(.*)$/, "home/topic/list?category=:1"],
    // [/^detail\/(.*)$/, "home/topic/detail?id=:1"],
    // [/^sp\/(.*)$/, "home/sp/index?category=:1"]
];