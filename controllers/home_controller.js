



module.exports.home = async (req,res)=>{
    try {
        return res.render('index');
    } catch (error) {
        console.log('Error', error);
        return;
    }
}

module.exports.signUp = async(req,res)=>{
    try {
        return res.render('patient_sign_up');
    } catch (error) {
        console.log('Error', error);
        return;
    }
}