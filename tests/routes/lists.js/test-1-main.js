const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');

const app = require('../../../server');
const config = require('../../configs');
const utils = require('./utils');
const errors = require('../../../utility/errors');

require('../../../models/accounts');
require('../../../models/profiles');
require('../../../models/list');
require('../../../models/listItem');

var Account      = mongoose.model('Account');
var Profile      = mongoose.model('Profile');
var List         = mongoose.model('List');
var ListItem     = mongoose.model('ListItem');

var obj_data = {token: '5', aid: '', listId: '', listItemId_one: '', listCount: 0, listItemCount: 0};

function setToken(t, v) {
    t.token = v;
}
function setAid(t, v) {
    t.aid = v;
}

function setFirstListId(t, v) {
    t.listId = v;
}
function incrListCount(t) {
    t.listCount += 1;
}
function incrListItemCount(t) {
    t.listItemCount += 1;
} 
function decrListCount(t) {
    t.listCount -= 1;
}
function decrListItemCount(t) {
    t.listItemCount -= 1;
}
function setListItem_one(t, v) {
    t.listItemId_one = v;
}

describe('CRUD lists and list items with logged in', () => {

    before((done) => {
        utils.generateLoginRequest("mk6598951@gmail.com", "Nitp@123")
            .set('x-access-token', obj_data.token)
            .expect(200)
            .end( (err, res) => {
            if(err) {
                return done(err)
            }
            
            const ai = res.body.data.profile_data.aid;
            const tok = res.body.data.token;
            setToken(obj_data, tok);
            setAid(obj_data, ai)
            done();
            })
    })

    /* ==================================== */

    it('/cr_list should create 1 list', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "business", "first list", 2, 2)
            .set('x-access-token', obj_data.token)
            .expect(200)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                // console.log(res.body.data._id);
                var first_list_id = res.body.data._id;
                setFirstListId(obj_data, first_list_id);
                incrListCount(obj_data);
                done();
            })
    })
    it('/cr_list should show error if no header set', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "business", "first list", 2, 2)
            
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/cr_list should show error if aid is empty', (done) => {
        utils.generateCreateListRequest('', "business", "first list", 2, 2)
            .set('x-access-token', obj_data.token)
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/cr_list should show error if type is empty', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "", "first list", 2, 2)
            .set('x-access-token', obj_data.token)
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/cr_list should show error if list name is empty', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "business", "", 2, 2)
            .set('x-access-token', obj_data.token)   
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/cr_list should show error if list type is empty', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "business", "name", '', 2)
            .set('x-access-token', obj_data.token)   
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/cr_list should show error if list vsbl is empty', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "business", "name", 2, '')
            .set('x-access-token', obj_data.token)   
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })

    it('/cr_list should show error if list name is more than 25', (done) => {
        l_name = "klgjeklrjgioerjgoiregoineroingroeignoirengoirnovnoegioer";
        utils.generateCreateListRequest(obj_data.aid, "business", l_name, 2, '')
            .set('x-access-token', obj_data.token)   
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    
    /* ==================================== */
    //first list item
    it('/cr_list_item - should create 1 list item', (done) => {
        utils.generateCreateSingleListItemRequest(obj_data.aid, obj_data.listId, 'item 1')
            .set('x-access-token', obj_data.token)
            .expect(200)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                console.log('+++++++++++++++++++++++++++++++++')
                var lsItem = JSON.parse(res.text);
                // console.log(lsItem.data._id);
                incrListItemCount(obj_data);
                setListItem_one(obj_data, lsItem.data._id);
                done();
            })
    })
    // second list item
    it('/cr_list_item - should create 1 list item', (done) => {
        utils.generateCreateSingleListItemRequest(obj_data.aid, obj_data.listId, 'item 1')
            .set('x-access-token', obj_data.token)
            .expect(200)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                incrListItemCount(obj_data);
                done();
            })
    })
    // third list item
    it('/cr_list_item - should create 1 list item', (done) => {
        utils.generateCreateSingleListItemRequest(obj_data.aid, obj_data.listId, 'item 1')
            .set('x-access-token', obj_data.token)
            .expect(200)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                incrListItemCount(obj_data);
                done();
            })
    })
    /* ==================================== */
    it('/cr_list_item - should show error in 1 list item wihtout list_name', (done) => {
        utils.generateCreateSingleListItemRequest(obj_data.aid, obj_data.listId, '')
            .set('x-access-token', obj_data.token)
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })

    /* ==================================== */

    // it('/cr_list_item_mult - should show error without lsid', (done) => {
    //     utils.generateCreateMultiListItemRequest('', ['item 2','item 3','item 4','item 5',])
    //         .set('x-access-token', obj_data.token)
    //         .expect(400)
    //         .end((err, res) => {
    //             if(err) {
    //                 return done(err)
    //             }
    //             
    //             done();
    //         })
    // })

    // it('/cr_list_item_mult - should create 4 list item', (done) => {
    //     utils.generateCreateMultiListItemRequest(obj_data.listId, ['item 2','item 3','item 4','item 5',])
    //         .set('x-access-token', obj_data.token)
    //         .expect(200)
    //         .end((err, res) => {
    //             if(err) {
    //                 return done(err)
    //             }
    //             // 4 TIMS INCREMENT
    //             incrListItemCount(obj_data);
    //             incrListItemCount(obj_data);
    //             incrListItemCount(obj_data);
    //             incrListItemCount(obj_data);
    //             done();
    //         })
    // })
    /*==========================================*/
    it('/init_list - should give list from lsid', (done) => {
        utils.generateInitListItemRequest(obj_data.listId)
            .expect(200)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/init_list - should show error if lsid is not given', (done) => {
        utils.generateInitListItemRequest('')
            .expect(400)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    /*==========================================*/
    it('should fetch all public lists and count them', (done) => {
        utils.generateFetchListRequest()
            .set('x-access-token', obj_data.token)
            .expect(200)
            .end((err, res) => {
                if(err) {
                    console.log(err);
                    return done(err)
                }
                var ls = res.body.data;
                var lsItems = JSON.parse(res.text);
                var lsItemsLength = lsItems.data[0].item.length;

                expect(ls.length).to.equal(obj_data.listCount)
                expect(lsItemsLength).to.equal(obj_data.listItemCount)

                done();  
            })
    })

    /*
      * fetch_list_v2 >>> this endpoint checking a lost of conditions, seed data accordingly
     */
    // it('should fetch all public lists from V2 and count them', (done) => {
    //     utils.generateFetchListRequest_v2()
    //         .set('x-access-token', obj_data.token)
    //         .expect(200)
    //         .end((err, res) => {
    //             if(err) {
    //                 console.log(err);
    //                 return done(err)
    //             }
    //             var ls = res.body.data;
    //             console.log('=======================');
    //             console.log(ls);
    //             console.log('=======================');
    //             // var lsItems = JSON.parse(res.text);
    //             // var lsItemsLength = lsItems.data[0].item.length;

    //             expect(ls.length).to.equal(obj_data.listCount)
    //             // expect(lsItemsLength).to.equal(obj_data.listItemCount)

    //             done();  
    //         })
    // })
    
    /*==========================================*/

    // it('shuld edit public list item', (done) =>{
    //     var lsitid = ''
    //     utils.generateEditListItem(obj_data.aid, obj_data.listId, obj_data.listItemId_one, 'updated list 1')
    //         .expect(200)
    //         .set('x-access-token', obj_data.token)
    //         .end((err, res) => {
    //             if(err) {
    //                 return done(err)
    //             }
    //             done();
    //         })
    // })

    it('should show error if lsid is not valid', (done) => {
        utils.generateEditListItem(obj_data.aid, '5374575trt34t34', obj_data.listItemId_one, 'updated list 1')
            .expect(400)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('should show error if lsItid is not valid', (done) =>{
        var lsitid = ''
        utils.generateEditListItem(obj_data.aid, obj_data.listId, 'sdgrgvsfgg56457yrreg', 'updated list 1')
            .expect(400)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('should show error if aid is not valid', (done) =>{
        var lsitid = ''
        utils.generateEditListItem('sfg3ytgregbfsvbsfvbgfs', obj_data.listId, obj_data.listItemId_one, 'updated list 1')
            .expect(400)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    /*==========================================*/
    
    it('should delete list item', (done) => {
        
        utils.generateDeleteListItemRequest(obj_data.aid, obj_data.listId, obj_data.listItemId_one)
            .expect(200)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    console.log(obj_data.listItemId_one)
                    console.log(obj_data.listId)
                    return done(err)
                }
                done();
            })
    })
    it('should show error if aid is invalid in delete list item', (done) => {
        utils.generateDeleteListItemRequest('sdgdrewyt45ygfgb356trg', obj_data.listId, obj_data.listItemId_one)
            .expect(400)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('should show error if listid is invalid in delete list item', (done) => {
        utils.generateDeleteListItemRequest(obj_data.aid, 'fregtt5tgrfv35tgrgv', obj_data.listItemId_one)
            .expect(400)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('should show error if listItemid is invalid in delete list item', (done) => {
        utils.generateDeleteListItemRequest(obj_data.aid, obj_data.listId, 'fregtt5tgrfv35tgrgv')
            .expect(400)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
     /*==========================================*/

     it('should show error if aid is not valid to delete list', (done) => {
        utils.generateDeleteListRequest('fret353tgdfsv35grvsfv', obj_data.listId)
           .expect(400)
           .set('x-access-token', obj_data.token)
           .end((err, res) => {
               if(err) {
                   return done(err)
               }
               done();
           })
    })

    it('should show error if listId is not valid to delete list', (done) => {
        utils.generateDeleteListRequest(obj_data.ai, 'cdste34wrfcdsc4fdsvccddtg34')
           .expect(400)
           .set('x-access-token', obj_data.token)
           .end((err, res) => {
               if(err) {
                   return done(err)
               }
               done();
           })
    })
     
     it('should delete list', (done) => {
         utils.generateDeleteListRequest(obj_data.aid, obj_data.listId)
            .expect(200)
            .set('x-access-token', obj_data.token)
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
     })

     /*==========================================*/

     it('/cr_list_v3 should create 1 list', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "category", "name", true, true, false, false)
            .set('x-access-token', obj_data.token)
            .expect(200)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                // console.log(res.body.data._id);
                var first_list_id = res.body.data._id;
                setFirstListId(obj_data, first_list_id);
                incrListCount(obj_data);
                done();
            })
    })
    
    it('/cr_list_v3 should not create list 1', (done) => {
        utils.generateCreateListRequest(obj_data.aid, null, "name", true, true, false, false)
            .set('x-access-token', obj_data.token)
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/cr_list_v3 should not create list 2', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "null", null , true, true, false, false)
            .set('x-access-token', obj_data.token)
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })
    it('/cr_list_v3 should not create list 3', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "null", "name", null, true, false, false)
            .set('x-access-token', obj_data.token)
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })

    it('/cr_list_v3 should not create list 6', (done) => {
        utils.generateCreateListRequest(obj_data.aid, "null", "name", true, true, true, true)
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })

    it('/cr_list_v3 should not create list 7', (done) => {
        utils.generateCreateListRequest(null, "null", "name", true, true, false, false)
            .set('x-access-token', obj_data.token)
            .expect(400)
            .end( (err, res) => {
                if(err) {
                    return done(err)
                }
                done();
            })
    })

})

