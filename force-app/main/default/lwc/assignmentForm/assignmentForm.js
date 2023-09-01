import { LightningElement, api, wire, track} from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import STATUS_FIELD from '@salesforce/schema/Assignment__c.Status__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ASSIGNMENT_OBJECT from '@salesforce/schema/Assignment__c';
import createRecord from '@salesforce/apex/AssignmentController.createAssignmentRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AssignmentForm extends LightningElement {
    @track newRecord;
    @api buttonText;
    @track storedRecord = {};
    @api assignment = {};


    @wire(getObjectInfo, { objectApiName: ASSIGNMENT_OBJECT })
    assignmentInfo;

    @wire(getPicklistValues,
        {
            recordTypeId: '$assignmentInfo.data.defaultRecordTypeId',
            fieldApiName: STATUS_FIELD
        }
    ) statusValues;

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
            console.log(this.storedRecord);
            this.newRecord[inputField.name] = inputField.value;
        });
        console.log(isValid);
        return isValid;
    }

    connectedCallback()
    {
        this.newRecord = {...this.assignment};
    }

    createRecord() {
        
        if (this.isInputValid()) {
            createRecord({ assignmentRecord : this.newRecord })
            .then(result => {
                this.message = result;
                this.error = undefined;
                if(this.message !== undefined) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Assignment Record created/Updated',
                            variant: 'success',
                        }),
                    );
                    this.dispatchEvent(new CustomEvent("refreshtable"));
                }
            })
            .catch(error => {
                this.message = undefined;
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
        }
    }

}