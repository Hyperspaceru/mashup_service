export default class MashupPage {
    constructor() {
        this.currentPage = []
        this._mashupCount = 0
        this.pageSize = 50
        this.pageCount = 0
    }
    _getPagesCount() {
        if (this.mashupCount > 0) {
            return Math.ceil(this.mashupCount / this.pageSize)
        } else {
            return 0
        } 
    }
    get mashupCount(){
        return this._mashupCount
    }
    set mashupCount(count){
        this._mashupCount = count
        this.pageCount = this._getPagesCount()
    }
    get length (){
        return this.currentPage.length
    }
}
