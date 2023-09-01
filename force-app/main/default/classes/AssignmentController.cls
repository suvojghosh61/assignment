public class AssignmentController 
{
	@AuraEnabled(cacheable=true)
    public static List<Assignment__c> getAssignmentList() {
        return [SELECT Id, Name, Description__c, DueDate__c,Status__c, Title__c FROM Assignment__c ORDER BY DueDate__c];
    }

    @AuraEnabled
    public static Assignment__c createAssignmentRecord(Assignment__c assignmentRecord) {
        upsert assignmentRecord;
        return assignmentRecord;
    }
}