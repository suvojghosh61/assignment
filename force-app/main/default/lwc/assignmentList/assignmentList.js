import { LightningElement ,api, wire, track} from 'lwc';
import getRecordList from '@salesforce/apex/AssignmentController.getAssignmentList';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';

const columns = [
    { label: 'Title', fieldName: 'Title__c',type: 'text',sortable: true },
    { label: 'Status', fieldName: 'Status__c',type: 'text',sortable: true },
    { label: 'Description', fieldName: 'Description__c',type: 'text' },
    { label: 'Due Date', fieldName: 'DueDate__c',type: 'text',sortable: true },
    {
        type: "button", label: 'Edit', initialWidth: 100, typeAttributes: {
            label: 'Edit',
            name: 'Edit',
            title: 'Edit',
            disabled: false,
            value: 'edit',
            iconPosition: 'left',
            iconName:'utility:edit',
            variant:'Brand'
        }
    },
];

export default class AssignmentList extends NavigationMixin(LightningElement) {

    value;
    areDetailsVisible = false;
    error;
    recordVariable = {
        Title__c : '',
        Status__c : '',
        DueDate__c : '',
        Description__c : ''
    }
    buttonVariable;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';
    result;
    allSelectedRows = [];
    page = 1; 
    items = []; 
    selectedId;
    data = []; 
    startingRecord = 1;
    endingRecord = 0; 
    pageSize = 5; 
    totalRecountCount = 0;
    totalPage = 0;
    isPageChanged = false;
    initialLoad = true;
    initialRecords;
    @track isModalOpen = false;
    
    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }

    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    // retrieving the data using wire service
    @wire(getRecordList) 
    assignmentList(result) {
    this.wiredResults = result;
        if (result.data) 
        {
            this.initialRecords = result.data;
            this.processRecords(result.data);
            this.error = undefined;

        } 
        else if (result.error) 
        {
            this.error = result.error;
            this.data = undefined;
        }
    }

    processRecords(data){
        this.items = data;
            this.totalRecountCount = data.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.columns = columns;
    }
    //clicking on previous button this method will be called
    previousHandler() {
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
          var selectedIds = [];
          for(var i=0; i<this.allSelectedRows.length;i++){
            selectedIds.push(this.allSelectedRows[i].Id);
          }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = selectedIds;
    }

    //clicking on next button this method will be called
    nextHandler() {
        this.isPageChanged = true;
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }
          var selectedIds = [];
          for(var i=0; i<this.allSelectedRows.length;i++){
            selectedIds.push(this.allSelectedRows[i].Id);
          }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = selectedIds;
    }

    //this method displays records page by page
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }    
    
    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return refreshApex(this.result);
        
    }

    callRowAction(event) {
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        if (actionName === 'Edit') {
            this.handleAction(recId);
        }
    }
    handleAction(recordId) {
        
        let selectedRecord = this.data.find(eachRecord => eachRecord.Id == recordId);
        this.recordVariable = selectedRecord;
        this.buttonVariable = 'Update';
        this.isModalOpen = true;
    }
    
    openNewRecord(event)
    {
        this.buttonVariable = 'Create';
        this.isModalOpen = true;
    }

    handleUpdate(event){
        this.isModalOpen = false;
        return refreshApex(this.wiredResults);
    }
    
    handleSearch(event) {
        const searchKey = event.target.value.toLowerCase();
        this.data = this.initialRecords;
        if (searchKey) {
            if (this.data) {
                let searchRecords = [];
                for (let record of this.data) {
                    if(record.Title__c.toLowerCase().includes(searchKey))
                    {
                        searchRecords.push(record);
                    }
                }
                this.data = searchRecords;
            }
        } else {
            this.data = this.initialRecords;
        }
    }

}